import { randomUUID } from "node:crypto";
import { MongoClient, Collection } from "mongodb";
import QRCode from "qrcode";
import {
  CreateTicketRequest,
  ScanResult,
  Ticket,
  TicketStore,
} from "@/types/ticket";

function generateTicketNumber(seed: string) {
  const sanitized = seed.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const base = sanitized.slice(-6) || sanitized || "UNI";
  const timeFragment = Date.now().toString(36).toUpperCase().slice(-4);
  const randomFragment = randomUUID().slice(0, 4).toUpperCase();
  return `${base}-${timeFragment}${randomFragment}`;
}

async function generateQRCode(ticketNumber: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(ticketNumber, {
      errorCorrectionLevel: "H",
      width: 256,
      margin: 1,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error("[generateQRCode] Error generating QR code:", error);
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

let mongoClientPromise: Promise<MongoClient> | null = null;

async function getMongoCollection(): Promise<Collection<Ticket>> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is required. Please configure MongoDB connection."
    );
  }

  if (!mongoClientPromise) {
    mongoClientPromise = MongoClient.connect(uri, {
      serverSelectionTimeoutMS: 5_000,
    });
  }

  const client = await mongoClientPromise;
  const dbName = process.env.MONGODB_DB ?? "tickets";
  const collection = client.db(dbName).collection<Ticket>("tickets");

  await collection.createIndex({ ticketNumber: 1 }, { unique: true });
  await collection.createIndex({ mail: 1 });

  return collection;
}

class MongoTicketStore implements TicketStore {
  private async collection() {
    return await getMongoCollection();
  }

  async getTickets(): Promise<Ticket[]> {
    const col = await this.collection();
    const tickets = await col.find().sort({ createdAt: -1 }).toArray();
    return tickets.map(this.deserialize);
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    const col = await this.collection();
    const ticket = await col.findOne({ id });
    return ticket ? this.deserialize(ticket) : null;
  }

  async getTicketByNumber(ticketNumber: string): Promise<Ticket | null> {
    const col = await this.collection();
    const ticket = await col.findOne({ ticketNumber });
    return ticket ? this.deserialize(ticket) : null;
  }

  async createTicket(payload: CreateTicketRequest): Promise<Ticket> {
    const col = await this.collection();
    let ticketNumber = generateTicketNumber(payload.mail);

    while (await col.findOne({ ticketNumber })) {
      ticketNumber = generateTicketNumber(payload.mail);
    }

    const qrCodeDataUrl = await generateQRCode(ticketNumber);

    const ticket: Ticket = {
      id: randomUUID(),
      ticketNumber,
      mail: payload.mail.trim().toLowerCase(),
      name: payload.name.trim(),
      createdAt: new Date(),
      isValid: true,
      scannedAt: null,
      qrCodeDataUrl,
    };

    await col.insertOne(ticket);
    return ticket;
  }

  async updateTicket(
    id: string,
    updates: Partial<Omit<Ticket, "id" | "createdAt" | "ticketNumber">>
  ): Promise<Ticket | null> {
    const col = await this.collection();
    const result = await col.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: "after" }
    );
    return result ? this.deserialize(result) : null;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const col = await this.collection();
    const result = await col.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async scanTicket(ticketNumber: string): Promise<ScanResult> {
    const col = await this.collection();
    const ticket = await col.findOne({ ticketNumber });
    if (!ticket) {
      return {
        isValid: false,
        message: "Ticket not found. Please verify the number.",
      };
    }

    if (!ticket.isValid) {
      return {
        isValid: false,
        ticket: this.deserialize(ticket),
        message: ticket.scannedAt
          ? `Ticket already used at ${new Date(ticket.scannedAt).toLocaleString()}.`
          : "Ticket has already been used.",
      };
    }

    const scannedAt = new Date();
    await col.updateOne(
      { ticketNumber },
      { $set: { isValid: false, scannedAt } }
    );

    return {
      isValid: true,
      ticket: this.deserialize({ ...ticket, isValid: false, scannedAt }),
      message: "Ticket validated successfully.",
    };
  }

  private deserialize(ticket: Ticket & { _id?: unknown }): Ticket {
    // Remove MongoDB _id and convert to plain object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...ticketData } = ticket;
    return {
      ...ticketData,
      createdAt: ticketData.createdAt instanceof Date 
        ? ticketData.createdAt 
        : new Date(ticketData.createdAt),
      scannedAt: ticketData.scannedAt 
        ? (ticketData.scannedAt instanceof Date 
            ? ticketData.scannedAt 
            : new Date(ticketData.scannedAt))
        : null,
    } as Ticket;
  }
}

let cachedStore: TicketStore | null = null;

async function resolveStore(): Promise<TicketStore> {
  if (cachedStore) {
    return cachedStore;
  }

  cachedStore = new MongoTicketStore();
  return cachedStore;
}

export async function listTickets() {
  const store = await resolveStore();
  return store.getTickets();
}

export async function getTicketById(id: string) {
  const store = await resolveStore();
  return store.getTicketById(id);
}

export async function getTicketByNumber(ticketNumber: string) {
  const store = await resolveStore();
  return store.getTicketByNumber(ticketNumber);
}

export async function createTicket(payload: CreateTicketRequest) {
  const store = await resolveStore();
  return store.createTicket(payload);
}

export async function updateTicket(
  id: string,
  updates: Partial<Omit<Ticket, "id" | "createdAt" | "ticketNumber">>
) {
  const store = await resolveStore();
  return store.updateTicket(id, updates);
}

export async function deleteTicket(id: string) {
  const store = await resolveStore();
  return store.deleteTicket(id);
}

export async function scanTicket(ticketNumber: string) {
  const store = await resolveStore();
  return store.scanTicket(ticketNumber);
}

export async function getTicketMetrics() {
  const tickets = await listTickets();
  const total = tickets.length;
  const scanned = tickets.filter((ticket) => !ticket.isValid).length;
  const pending = total - scanned;

  return {
    total,
    scanned,
    pending,
  };
}


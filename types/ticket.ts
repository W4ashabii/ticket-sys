export interface Ticket {
  id: string;
  serialNumber: number;
  ticketNumber: string;
  mail: string;
  name: string;
  universityId: string;
  issuedByName: string;
  issuedByEmail: string;
  createdAt: Date;
  isValid: boolean;
  scannedAt: Date | null;
  qrCodeDataUrl: string;
}

export interface CreateTicketRequest {
  mail: string;
  name: string;
  universityId: string;
  issuedByName?: string;
  issuedByEmail?: string;
}

export interface ScanResult {
  isValid: boolean;
  ticket?: Ticket;
  message: string;
}

export interface TicketStore {
  getTickets(): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | null>;
  getTicketByNumber(ticketNumber: string): Promise<Ticket | null>;
  createTicket(payload: CreateTicketRequest): Promise<Ticket>;
  updateTicket(
    id: string,
    updates: Partial<
      Omit<Ticket, "id" | "createdAt" | "ticketNumber" | "serialNumber">
    >
  ): Promise<Ticket | null>;
  deleteTicket(id: string): Promise<boolean>;
  scanTicket(ticketNumber: string): Promise<ScanResult>;
}


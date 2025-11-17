import { NextResponse } from "next/server";
import { z } from "zod";
import { createTicket, listTickets } from "@/lib/storage";
import { sendTicketEmail } from "@/lib/email";

const createTicketSchema = z.object({
  name: z.string().min(2, "Name is required"),
  mail: z.string().email("Valid mail required"),
});

export const dynamic = "force-dynamic";

export async function GET() {
  const tickets = await listTickets();
  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createTicketSchema.parse(body);

    const ticket = await createTicket(parsed);

    try {
      await sendTicketEmail(ticket);
    } catch (error) {
      console.warn("[email] Ticket created but email failed", error);
    }

    return NextResponse.json(
      { ticket },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    console.error("[tickets:POST]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unable to create ticket";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}


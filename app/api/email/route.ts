import { NextResponse } from "next/server";
import { z } from "zod";
import { getTicketById, getTicketByNumber } from "@/lib/storage";
import { sendTicketEmail } from "@/lib/email";
import { requireIssuerSession } from "@/lib/auth";

const emailSchema = z
  .object({
    ticketId: z.string().uuid().optional(),
    ticketNumber: z.string().optional(),
  })
  .refine(
    (data) => data.ticketId || data.ticketNumber,
    "Provide a ticketId or ticketNumber"
  );

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireIssuerSession();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const parsed = emailSchema.parse(body);

    const ticket = parsed.ticketId
      ? await getTicketById(parsed.ticketId)
      : parsed.ticketNumber
        ? await getTicketByNumber(parsed.ticketNumber)
        : null;

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    await sendTicketEmail(ticket);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    console.error("[email:POST]", error);
    return NextResponse.json(
      { message: "Unable to send email" },
      { status: 500 }
    );
  }
}


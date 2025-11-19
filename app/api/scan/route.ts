import { NextResponse } from "next/server";
import { z } from "zod";
import { scanTicket } from "@/lib/storage";
import { requireIssuerSession } from "@/lib/auth";

const scanSchema = z.object({
  ticketNumber: z.string().min(3, "Ticket number required"),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireIssuerSession();
    if (!session) {
      return NextResponse.json(
        { isValid: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { ticketNumber } = scanSchema.parse(body);

    const result = await scanTicket(ticketNumber.trim());
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { isValid: false, message: error.issues[0]?.message },
        { status: 400 }
      );
    }

    console.error("[scan:POST]", error);
    return NextResponse.json(
      { isValid: false, message: "Scanner unavailable" },
      { status: 500 }
    );
  }
}


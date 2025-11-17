import { NextResponse } from "next/server";
import { z } from "zod";
import { getTicketById, updateTicket, deleteTicket } from "@/lib/storage";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  mail: z.string().email().optional(),
  isValid: z.boolean().optional(),
});

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  const ticket = await getTicketById(id);
  if (!ticket) {
    return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
  }
  return NextResponse.json({ ticket });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates = updateSchema.parse(body);

    const ticket = await updateTicket(id, updates);
    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }
    console.error("[tickets:id:PUT]", error);
    return NextResponse.json(
      { message: "Unable to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await params;
    const deleted = await deleteTicket(id);
    if (!deleted) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Ticket deleted" });
  } catch (error) {
    console.error("[tickets:id:DELETE]", error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Unable to delete ticket" 
      },
      { status: 500 }
    );
  }
}


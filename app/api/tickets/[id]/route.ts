import { NextResponse } from "next/server";
import { z } from "zod";
import { getTicketById, updateTicket, deleteTicket } from "@/lib/storage";
import { requireIssuerSession } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  mail: z.string().email().optional(),
  isValid: z.boolean().optional(),
  universityId: z.string().min(3).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await requireIssuerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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
    const session = await requireIssuerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const updates = updateSchema.parse(body);
    const normalizedUpdates = {
      ...updates,
      ...(updates.universityId
        ? { universityId: updates.universityId.trim().toUpperCase() }
        : {}),
    };

    const ticket = await updateTicket(id, normalizedUpdates);
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
        { message: error.issues[0]?.message ?? "Invalid payload" },
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
    const session = await requireIssuerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
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


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { formatDate } from "@/lib/utils";

interface TicketRowProps {
  ticket: {
    id: string;
    ticketNumber: string;
    mail: string;
    name: string;
    createdAt: string | Date;
    isValid: boolean;
    scannedAt: string | Date | null;
    qrCodeDataUrl: string;
  };
}

export function TicketRow({ ticket }: TicketRowProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete ticket ${ticket.ticketNumber}? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.message ?? `Failed to delete ticket (${response.status})`
        );
      }

      pushToast({
        variant: "success",
        title: "Ticket deleted",
        description: `Ticket ${ticket.ticketNumber} has been removed.`,
      });

      router.refresh();
    } catch (error) {
      console.error("[TicketRow:handleDelete]", error);
      pushToast({
        variant: "error",
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className="border-t border-black/10 transition-all duration-200 hover:bg-black/5 hover:shadow-sm">
      <td className="py-3 sm:py-4 font-mono text-xs font-semibold text-black">
        <div>
          <div>{ticket.ticketNumber}</div>
          <div className="text-xs text-black/60 sm:hidden mt-1">{ticket.name}</div>
        </div>
      </td>
      <td className="py-3 sm:py-4 text-xs sm:text-sm font-medium text-black hidden sm:table-cell">{ticket.name}</td>
      <td className="py-3 sm:py-4 text-xs sm:text-sm text-black/60 hidden md:table-cell">{ticket.mail}</td>
      <td className="py-3 sm:py-4">
        <span
          className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
            ticket.isValid
              ? "border-black/20 bg-black/5 text-black"
              : "border-black/10 bg-black/5 text-black/40"
          }`}
        >
          {ticket.isValid ? "Valid" : "Used"}
        </span>
      </td>
      <td className="py-3 sm:py-4 text-xs text-black/50 hidden lg:table-cell">
        {formatDate(
          ticket.createdAt instanceof Date 
            ? ticket.createdAt 
            : new Date(ticket.createdAt)
        )}
      </td>
      <td className="py-3 sm:py-4">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-lg text-black border border-black/20 transition-all duration-200 hover:bg-black hover:text-white hover:border-black hover:shadow-modern disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black active:scale-[0.95] touch-manipulation min-h-[44px]"
          aria-label={`Delete ticket ${ticket.ticketNumber}`}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}


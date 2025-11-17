"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface AttendeeTicket {
  id: string;
  ticketNumber: string;
  mail: string;
  name: string;
  createdAt: string | Date;
  isValid: boolean;
  scannedAt: string | Date | null;
  qrCodeDataUrl: string;
}

interface AttendeesListProps {
  tickets: AttendeeTicket[];
}

export function AttendeesList({ tickets }: AttendeesListProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) {
      return tickets;
    }
    const query = searchQuery.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.name.toLowerCase().includes(query) ||
        ticket.mail.toLowerCase().includes(query) ||
        ticket.ticketNumber.toLowerCase().includes(query)
    );
  }, [tickets, searchQuery]);

  const handleValidate = async (ticket: AttendeeTicket) => {
    if (!ticket.isValid) {
      pushToast({
        variant: "error",
        title: "Ticket already used",
        description: `Ticket ${ticket.ticketNumber} has already been validated.`,
      });
      return;
    }

    setValidatingId(ticket.id);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketNumber: ticket.ticketNumber }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to validate ticket");
      }

      pushToast({
        variant: payload.isValid ? "success" : "error",
        title: payload.isValid ? "Ticket validated" : "Validation failed",
        description: payload.message,
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      pushToast({
        variant: "error",
        title: "Validation failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setValidatingId(null);
    }
  };

  return (
    <Card
      title="All Attendees"
      description={`${filteredTickets.length} of ${tickets.length} tickets`}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 sm:max-w-md">
            <Input
              label="Search attendees"
              placeholder="Search by name, email, or ticket number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="whitespace-nowrap"
            >
              Clear search
            </Button>
          )}
        </div>

        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-black/50 font-normal">
              {searchQuery
                ? "No attendees found matching your search."
                : "No attendees registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-black/70 border-b border-black/10">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4 hidden sm:table-cell">Email</th>
                    <th className="py-3 pr-4">Ticket</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4 hidden lg:table-cell">Created</th>
                    <th className="py-3 pr-4 hidden lg:table-cell">Scanned</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-t border-black/10 transition-all duration-200 hover:bg-black/5 hover:shadow-sm"
                  >
                    <td className="py-4 text-sm font-medium text-black">
                      <div>
                        <div>{ticket.name}</div>
                        <div className="text-xs text-black/50 sm:hidden mt-1">
                          {ticket.mail}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-black/60 hidden sm:table-cell">
                      {ticket.mail}
                    </td>
                    <td className="py-4 font-mono text-xs font-semibold text-black">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                          ticket.isValid
                            ? "border-black/20 bg-black/5 text-black"
                            : "border-black/10 bg-black/5 text-black/40"
                        }`}
                      >
                        {ticket.isValid ? "Valid" : "Used"}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-black/50 hidden lg:table-cell">
                      {formatDate(
                        ticket.createdAt instanceof Date
                          ? ticket.createdAt
                          : new Date(ticket.createdAt)
                      )}
                    </td>
                    <td className="py-4 text-xs text-black/50 hidden lg:table-cell">
                      {ticket.scannedAt
                        ? formatDate(
                            ticket.scannedAt instanceof Date
                              ? ticket.scannedAt
                              : new Date(ticket.scannedAt)
                          )
                        : "—"}
                    </td>
                    <td className="py-4">
                      <Button
                        variant={ticket.isValid ? "primary" : "secondary"}
                        onClick={() => handleValidate(ticket)}
                        disabled={
                          !ticket.isValid || validatingId === ticket.id
                        }
                        className="text-xs px-3 py-1.5 whitespace-nowrap"
                      >
                        {validatingId === ticket.id
                          ? "Validating..."
                          : ticket.isValid
                          ? "Validate"
                          : "Used"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}


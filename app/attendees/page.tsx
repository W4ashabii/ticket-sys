import { listTickets } from "@/lib/storage";
import { AttendeesList } from "@/components/attendees/AttendeesList";

export const dynamic = "force-dynamic";

export default async function AttendeesPage() {
  const tickets = await listTickets();

  // Convert tickets to plain objects for client components
  const serializedTickets = tickets.map((ticket) => ({
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    mail: ticket.mail,
    name: ticket.name,
    createdAt: ticket.createdAt instanceof Date 
      ? ticket.createdAt.toISOString() 
      : ticket.createdAt,
    isValid: ticket.isValid,
    scannedAt: ticket.scannedAt instanceof Date 
      ? ticket.scannedAt.toISOString() 
      : ticket.scannedAt,
    qrCodeDataUrl: ticket.qrCodeDataUrl,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:gap-8 lg:gap-12 px-4 py-6 sm:py-8 lg:py-12 sm:px-6">
      <header className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-modern">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50 mb-2 sm:mb-3">
            Attendee Management
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-black mb-3 sm:mb-4">
            Track all attendees and tickets
          </h1>
          <p className="text-sm sm:text-base font-normal text-black/60 leading-relaxed max-w-2xl">
            Search by name, view ticket details, and validate tickets directly from this page.
          </p>
        </div>
      </header>

      <AttendeesList tickets={serializedTickets} />
    </div>
  );
}


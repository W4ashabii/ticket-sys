import Link from "next/link";
import { listTickets, getTicketMetrics } from "@/lib/storage";
import { Card } from "@/components/ui/Card";
import { TicketRow } from "@/components/admin/TicketRow";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [tickets, metrics] = await Promise.all([
    listTickets(),
    getTicketMetrics(),
  ]);

  // Convert tickets to plain objects for client components
  const latestTickets = tickets.slice(0, 5).map((ticket) => ({
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
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black">
              Ticket Counter
            </h1>
          </div>
          <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="rounded-xl border border-black/20 bg-white px-5 py-3 sm:px-6 text-center text-sm font-semibold text-black transition-all duration-200 hover:bg-black hover:text-white hover:shadow-modern-lg hover:border-black active:scale-[0.98] touch-manipulation"
            >
              Admin panel
            </Link>
            <Link
              href="/attendees"
              className="rounded-xl border border-black/20 bg-white px-5 py-3 sm:px-6 text-center text-sm font-semibold text-black transition-all duration-200 hover:bg-black hover:text-white hover:shadow-modern-lg hover:border-black active:scale-[0.98] touch-manipulation"
            >
              View attendees
            </Link>
            <Link
              href="/scanner"
              className="rounded-xl border border-black bg-black px-5 py-3 sm:px-6 text-center text-sm font-semibold !text-white transition-all duration-200 hover:bg-black/90 hover:!text-white hover:shadow-modern-lg active:scale-[0.98] touch-manipulation"
            >
              Open scanner
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Total tickets" className="animate-in fade-in">
          <p className="text-4xl sm:text-5xl font-bold text-black mb-2">
            {metrics.total}
          </p>
          <p className="text-xs sm:text-sm font-normal text-black/50">Issued since restart</p>
        </Card>
        <Card title="Pending scans" className="animate-in fade-in" style={{ animationDelay: "0.1s" }}>
          <p className="text-4xl sm:text-5xl font-bold text-black mb-2">
            {metrics.pending}
          </p>
          <p className="text-xs sm:text-sm font-normal text-black/50">Still valid</p>
        </Card>
        <Card title="Completed scans" className="animate-in fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-4xl sm:text-5xl font-bold text-black mb-2">
            {metrics.scanned}
          </p>
          <p className="text-xs sm:text-sm font-normal text-black/50">Marked as used</p>
        </Card>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-modern">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-black/10 pb-3 sm:pb-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-black">
              Recent tickets
            </h2>
            <p className="text-xs sm:text-sm font-normal text-black/50 mt-1">
              Latest activity across admin and scanner actions.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-xs sm:text-sm font-semibold text-black hover:text-black/70 transition-colors touch-manipulation py-2"
          >
            Create ticket →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-black/70 border-b border-black/10">
                  <th className="py-2 sm:py-3 pr-2">Ticket</th>
                  <th className="py-2 sm:py-3 pr-2 hidden sm:table-cell">Attendee</th>
                  <th className="py-2 sm:py-3 pr-2 hidden md:table-cell">Mail</th>
                  <th className="py-2 sm:py-3 pr-2">Status</th>
                  <th className="py-2 sm:py-3 pr-2 hidden lg:table-cell">Created</th>
                  <th className="py-2 sm:py-3">Actions</th>
                </tr>
              </thead>
            <tbody>
              {latestTickets.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-black/60 text-sm"
                  >
                    No tickets yet. Use the admin panel to get started.
                  </td>
                </tr>
              )}
              {latestTickets.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

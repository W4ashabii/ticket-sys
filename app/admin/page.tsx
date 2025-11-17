import { TicketForm } from "@/components/admin/TicketForm";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <section className="space-y-6 sm:space-y-8 lg:space-y-12">
      <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-modern">
        <p className="text-xs font-semibold uppercase tracking-wider text-black/50 mb-2 sm:mb-3">
          Admin panel
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-black mb-3 sm:mb-4">
          Register attendees and distribute tickets
        </h1>
        <p className="text-sm sm:text-base font-normal text-black/60 leading-relaxed max-w-2xl">
          Collect only the essentials—name and mail—and we&apos;ll issue a unique
          ticket number plus QR code in seconds. Everything is optimized for
          phone wallets and repeat-free scanning.
        </p>
      </div>
      <TicketForm />
    </section>
  );
}


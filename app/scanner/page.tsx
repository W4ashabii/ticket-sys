import { redirect } from "next/navigation";
import { Scanner } from "@/components/scanner/Scanner";
import { requireIssuerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ScannerPage() {
  const session = await requireIssuerSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 sm:gap-8 lg:gap-12 px-4 py-6 sm:py-8 lg:py-12 sm:px-6">
      <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-modern">
        <p className="text-xs font-semibold uppercase tracking-wider text-black/50 mb-2 sm:mb-3">
          Ticket validation
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-black mb-3 sm:mb-4">
          Scan tickets in real time
        </h1>
        <p className="text-sm sm:text-base font-normal text-black/60 leading-relaxed max-w-2xl">
          Type a ticket number or pop open the built-in camera scanner. Every
          QR code is single-use, so the moment it&apos;s validated we&apos;ll prevent
          any duplicate entries.
        </p>
      </div>
      <Scanner />
    </div>
  );
}


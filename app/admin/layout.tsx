import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center gap-2 text-xs font-normal text-black/50">
        <Link href="/" className="hover:text-black transition-colors duration-200">Dashboard</Link>
        <span aria-hidden="true" className="text-black/30">/</span>
        <span className="font-semibold text-black">Admin</span>
      </div>
      {children}
    </div>
  );
}


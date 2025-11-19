import { redirect } from "next/navigation";
import Link from "next/link";
import { requireIssuerSession } from "@/lib/auth";
import { LoginButton } from "@/components/auth/LoginButton";

export default async function LoginPage() {
  const session = await requireIssuerSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-4 py-12 text-center sm:px-6">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">
          Ticket Issuer Access
        </p>
        <h1 className="text-3xl font-bold text-black sm:text-4xl">
          Sign in with your Google account
        </h1>
        <p className="text-sm text-black/60 sm:text-base">
          Access to ticket issuance and scanners is restricted to verified Google accounts.
        </p>
      </div>
      <LoginButton />
      <Link href="/" className="text-xs font-semibold text-black/60 hover:text-black">
        ← Back to dashboard
      </Link>
    </div>
  );
}


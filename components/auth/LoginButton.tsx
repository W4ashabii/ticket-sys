"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/admin" });
    } catch (error) {
      console.error("[LoginButton] signIn failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl border border-black bg-black px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Connecting…" : "Continue with Google"}
    </button>
  );
}


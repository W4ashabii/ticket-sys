"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { formatSerialNumber } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface TicketFormProps {
  issuer: {
    name?: string;
    email?: string;
  };
}

export function TicketForm({ issuer }: TicketFormProps) {
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    mail: "",
    universityId: "",
  });

  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const payload = await response.json();

      if (!response.ok) {
        const errorMsg = payload?.message ?? `Unable to create ticket (${response.status})`;
        console.error("[TicketForm] Ticket creation error:", errorMsg, payload);
        throw new Error(errorMsg);
      }

      setLastTicket(payload.ticket);
      setFormValues({
        name: "",
        mail: "",
        universityId: "",
      });

      pushToast({
        variant: "success",
        title: "Ticket created",
        description: `Ticket ${payload.ticket.ticketNumber} (Serial ${formatSerialNumber(
          payload.ticket.serialNumber
        )}) sent to ${payload.ticket.mail}`,
      });
    } catch (error) {
      pushToast({
        variant: "error",
        title: "Ticket creation failed",
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr,1fr]">
      <Card
        title="Register attendee"
        description="Capture attendee details and instantly issue a mobile-ready pass."
      >
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-xs text-black/70 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Issuing as{" "}
            <span className="font-semibold text-black">
              {issuer.name || issuer.email || "Authorized issuer"}
            </span>{" "}
            ({issuer.email || "no email"}). Ticket emails will include your name and address.
          </div>
          <LogoutButton />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            name="name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            value={formValues.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
          />
          <Input
            label="Mail"
            name="mail"
            type="email"
            placeholder="ada@mail.com"
            autoComplete="email"
            value={formValues.mail}
            onChange={(event) => handleChange("mail", event.target.value)}
            required
          />
          <div className="space-y-2">
            <Input
              label="University ID (IIMS watermark)"
              name="universityId"
              placeholder="IIMS-2024-001"
              value={formValues.universityId}
              onChange={(event) => handleChange("universityId", event.target.value.toUpperCase())}
              required
            />
            <p className="text-xs text-black/50 font-normal">
              Appears as the IIMS watermark on the ticket email. Serial numbers are assigned automatically when issuing the ticket.
            </p>
          </div>
          <Button type="submit" loading={loading} fullWidth>
            Issue ticket
          </Button>
        </form>
      </Card>
      <Card
        title="Latest ticket"
        description="Quick snapshot of the most recent registration."
      >
        {lastTicket ? (
          <div className="space-y-6 text-sm animate-in fade-in slide-in-from-bottom-4">
            <dl className="space-y-4 border-b border-black/10 pb-4">
              <div className="flex justify-between">
                <dt className="font-semibold text-black text-xs">Ticket number</dt>
                <dd className="font-mono font-semibold text-black">{lastTicket.ticketNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-black text-xs">Serial number</dt>
                <dd className="font-mono font-semibold text-black">
                  {formatSerialNumber(lastTicket.serialNumber)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-black text-xs">Attendee</dt>
                <dd className="text-black font-medium">{lastTicket.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-black text-xs">Mail</dt>
                <dd className="text-black/60">{lastTicket.mail}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-black text-xs">University ID</dt>
                <dd className="font-mono text-black/80">{lastTicket.universityId || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-black text-xs">Issued by</dt>
                <dd className="text-black text-right">
                  <div className="font-medium">{lastTicket.issuedByName}</div>
                  <p className="text-black/60 text-[11px]">{lastTicket.issuedByEmail}</p>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-black text-xs">Status</dt>
                <dd className={`font-semibold text-xs rounded-lg border px-3 py-1 ${
                  lastTicket.isValid 
                    ? "border-black/20 bg-black/5 text-black" 
                    : "border-black/10 bg-black/5 text-black/40"
                }`}>
                  {lastTicket.isValid ? "Valid" : "Used"}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-black/10 bg-black/5 p-4">
              <div className="rounded-lg border border-black/20 bg-white p-2 shadow-sm">
                <Image
                  src={lastTicket.qrCodeDataUrl}
                  alt="QR code"
                  width={112}
                  height={112}
                  className="h-28 w-28"
                  unoptimized
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-black/50 font-normal">
            No tickets registered yet. Submit the form to see details here.
          </p>
        )}
      </Card>
    </div>
  );
}


export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: Date | string | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSerialNumber(value?: number | null, digits = 4) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return "—";
  }
  return value.toString().padStart(digits, "0");
}


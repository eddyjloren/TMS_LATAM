export function formatoMoneda(valor: number | string) {
  const n = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);
}

export function formatoFecha(fecha: Date | string | null | undefined) {
  if (!fecha) return "—";
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function formatoKm(valor: number | string) {
  const n = typeof valor === "string" ? parseFloat(valor) : valor;
  return `${new Intl.NumberFormat("es-MX").format(n || 0)} km`;
}

export function cn(...clases: Array<string | false | null | undefined>) {
  return clases.filter(Boolean).join(" ");
}

/** Días restantes entre hoy y una fecha futura (negativo si ya venció). */
export function diasRestantes(fecha: Date | string | null | undefined): number | null {
  if (!fecha) return null;
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const ms = d.getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

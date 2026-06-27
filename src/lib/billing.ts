/**
 * Adaptador de cobro recurrente para la suscripción mensual del SaaS.
 *
 * El cobro con tarjeta a clientes requiere un procesador de pagos regulado
 * (Stripe, Conekta, Openpay, etc.) - no puede ser "open source" porque
 * involucra movimiento de dinero y cumplimiento normativo (PCI-DSS, etc.).
 *
 * Modo "manual" (default): el administrador del SaaS registra los pagos
 * manualmente (transferencia, depósito) y el sistema solo lleva el control
 * de vigencia/estatus. Modo "stripe": ejemplo de integración para cuando se
 * quiera automatizar el cobro con tarjeta (requiere STRIPE_SECRET_KEY).
 */

export type ProveedorCobro = "manual" | "stripe";

export function proveedorCobroActivo(): ProveedorCobro {
  return (process.env.BILLING_PROVIDER as ProveedorCobro) || "manual";
}

export function siguienteFechaCobro(desde: Date = new Date()): Date {
  const fecha = new Date(desde);
  fecha.setMonth(fecha.getMonth() + 1);
  return fecha;
}

/*
 * Ejemplo de integración real con Stripe (referencia, no activa por defecto):
 *
 * import Stripe from "stripe";
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *
 * export async function crearSuscripcionStripe(customerId: string, priceId: string) {
 *   return stripe.subscriptions.create({ customer: customerId, items: [{ price: priceId }] });
 * }
 */

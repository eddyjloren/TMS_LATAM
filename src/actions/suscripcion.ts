"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSesion, requireRol } from "@/lib/session";
import { siguienteFechaCobro } from "@/lib/billing";

export async function obtenerSuscripcion() {
  const sesion = await requireSesion();
  return prisma.suscripcion.findUnique({
    where: { empresaId: sesion.empresaId },
    include: { plan: true, pagos: { orderBy: { createdAt: "desc" }, take: 12 } }
  });
}

export async function listarPlanes() {
  return prisma.plan.findMany({ orderBy: { precioMensual: "asc" } });
}

/** Cambia el plan de la empresa actual (solo ADMIN). */
export async function cambiarPlan(planId: string) {
  const sesion = await requireSesion();
  requireRol(sesion, ["ADMIN"]);

  await prisma.suscripcion.update({
    where: { empresaId: sesion.empresaId },
    data: { planId }
  });

  revalidatePath("/dashboard/suscripcion");
  return { ok: true };
}

/**
 * Registra el pago del periodo actual (modo manual: lo marca el ADMIN al
 * recibir la transferencia/depósito) y activa la suscripción si estaba en
 * prueba o con pago pendiente.
 */
export async function registrarPagoManual(monto: number) {
  const sesion = await requireSesion();
  requireRol(sesion, ["ADMIN"]);

  const suscripcion = await prisma.suscripcion.findUnique({ where: { empresaId: sesion.empresaId } });
  if (!suscripcion) return { ok: false, error: "Suscripción no encontrada" };

  const periodoInicio = new Date();
  const periodoFin = siguienteFechaCobro(periodoInicio);

  await prisma.$transaction([
    prisma.pago.create({
      data: {
        suscripcionId: suscripcion.id,
        monto,
        periodoInicio,
        periodoFin,
        estatus: "PAGADO",
        pagadoEn: new Date()
      }
    }),
    prisma.suscripcion.update({
      where: { id: suscripcion.id },
      data: { estatus: "ACTIVA", fechaProximoCobro: periodoFin }
    })
  ]);

  revalidatePath("/dashboard/suscripcion");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/session";
import { mantenimientoSchema } from "@/lib/validations";

export async function listarMantenimientos() {
  const sesion = await requireSesion();
  return prisma.mantenimiento.findMany({
    where: { empresaId: sesion.empresaId },
    include: { vehiculo: true },
    orderBy: [{ estatus: "asc" }, { fechaProgramada: "asc" }]
  });
}

/**
 * Mantenimientos PROGRAMADOS cuya alerta debe activarse porque el odómetro
 * actual del vehículo ya alcanzó (o está cerca de) el km programado, o
 * porque la fecha programada ya pasó / está próxima (7 días).
 */
export async function listarAlertasMantenimiento() {
  const sesion = await requireSesion();
  const pendientes = await prisma.mantenimiento.findMany({
    where: { empresaId: sesion.empresaId, estatus: "PROGRAMADO" },
    include: { vehiculo: true }
  });

  const hoy = new Date();
  const enSieteDias = new Date();
  enSieteDias.setDate(hoy.getDate() + 7);

  return pendientes.filter((m) => {
    const porKm =
      m.kmProgramado != null && Number(m.vehiculo.odometroKm) >= Number(m.kmProgramado) - 500;
    const porFecha = m.fechaProgramada != null && new Date(m.fechaProgramada) <= enSieteDias;
    return porKm || porFecha;
  });
}

export async function crearMantenimiento(formData: FormData) {
  const sesion = await requireSesion();

  const parsed = mantenimientoSchema.safeParse({
    vehiculoId: formData.get("vehiculoId"),
    tipo: formData.get("tipo"),
    descripcion: formData.get("descripcion"),
    kmProgramado: formData.get("kmProgramado") || undefined,
    fechaProgramada: formData.get("fechaProgramada") || undefined,
    costo: formData.get("costo") || undefined,
    taller: formData.get("taller") || undefined,
    notas: formData.get("notas") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Datos inválidos" };
  }

  const data = parsed.data;

  const vehiculo = await prisma.vehiculo.findFirst({
    where: { id: data.vehiculoId, empresaId: sesion.empresaId }
  });
  if (!vehiculo) return { ok: false, error: "Vehículo no encontrado" };

  await prisma.mantenimiento.create({
    data: {
      empresaId: sesion.empresaId,
      vehiculoId: data.vehiculoId,
      tipo: data.tipo,
      descripcion: data.descripcion,
      kmProgramado: data.kmProgramado,
      fechaProgramada: data.fechaProgramada ? new Date(data.fechaProgramada) : null,
      costo: data.costo,
      taller: data.taller,
      notas: data.notas
    }
  });

  revalidatePath("/dashboard/mantenimiento");
  revalidatePath(`/dashboard/flota/${data.vehiculoId}`);
  return { ok: true };
}

export async function completarMantenimiento(id: string, kmAlRealizar: number, costo?: number) {
  const sesion = await requireSesion();

  const mantenimiento = await prisma.mantenimiento.findFirst({
    where: { id, empresaId: sesion.empresaId }
  });
  if (!mantenimiento) return { ok: false, error: "No encontrado" };

  await prisma.$transaction([
    prisma.mantenimiento.update({
      where: { id },
      data: {
        estatus: "COMPLETADO",
        fechaRealizado: new Date(),
        kmAlRealizar,
        costo: costo ?? mantenimiento.costo
      }
    }),
    prisma.vehiculo.update({
      where: { id: mantenimiento.vehiculoId },
      data: { estatus: "DISPONIBLE", odometroKm: kmAlRealizar }
    })
  ]);

  revalidatePath("/dashboard/mantenimiento");
  revalidatePath(`/dashboard/flota/${mantenimiento.vehiculoId}`);
  return { ok: true };
}

export async function cancelarMantenimiento(id: string) {
  const sesion = await requireSesion();
  const mantenimiento = await prisma.mantenimiento.findFirst({
    where: { id, empresaId: sesion.empresaId }
  });
  if (!mantenimiento) return { ok: false, error: "No encontrado" };

  await prisma.mantenimiento.update({
    where: { id },
    data: { estatus: "CANCELADO" }
  });
  revalidatePath("/dashboard/mantenimiento");
  return { ok: true };
}

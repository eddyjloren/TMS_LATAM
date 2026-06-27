"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/session";
import { vehiculoSchema, choferSchema } from "@/lib/validations";

export async function listarVehiculos() {
  const sesion = await requireSesion();
  return prisma.vehiculo.findMany({
    where: { empresaId: sesion.empresaId },
    include: { choferAsignado: true },
    orderBy: { numeroEconomico: "asc" }
  });
}

export async function obtenerVehiculo(id: string) {
  const sesion = await requireSesion();
  return prisma.vehiculo.findFirst({
    where: { id, empresaId: sesion.empresaId },
    include: {
      choferAsignado: true,
      mantenimientos: { orderBy: { createdAt: "desc" } }
    }
  });
}

export async function crearVehiculo(formData: FormData) {
  const sesion = await requireSesion();

  const parsed = vehiculoSchema.safeParse({
    numeroEconomico: formData.get("numeroEconomico"),
    placas: formData.get("placas"),
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    anio: formData.get("anio"),
    tipo: formData.get("tipo"),
    capacidadCarga: formData.get("capacidadCarga") || undefined,
    odometroKm: formData.get("odometroKm") || 0,
    polizaSeguro: formData.get("polizaSeguro") || undefined,
    vigenciaSeguro: formData.get("vigenciaSeguro") || undefined,
    vigenciaPermiso: formData.get("vigenciaPermiso") || undefined,
    notas: formData.get("notas") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Datos inválidos" };
  }

  const data = parsed.data;
  const choferAsignadoId = (formData.get("choferAsignadoId") as string) || null;

  await prisma.vehiculo.create({
    data: {
      empresaId: sesion.empresaId,
      numeroEconomico: data.numeroEconomico,
      placas: data.placas,
      marca: data.marca,
      modelo: data.modelo,
      anio: data.anio,
      tipo: data.tipo,
      capacidadCarga: data.capacidadCarga,
      odometroKm: data.odometroKm,
      polizaSeguro: data.polizaSeguro,
      vigenciaSeguro: data.vigenciaSeguro ? new Date(data.vigenciaSeguro) : null,
      vigenciaPermiso: data.vigenciaPermiso ? new Date(data.vigenciaPermiso) : null,
      notas: data.notas,
      choferAsignadoId: choferAsignadoId || null
    }
  });

  revalidatePath("/dashboard/flota");
  return { ok: true };
}

export async function actualizarEstatusVehiculo(id: string, estatus: string) {
  const sesion = await requireSesion();
  const vehiculo = await prisma.vehiculo.findFirst({ where: { id, empresaId: sesion.empresaId } });
  if (!vehiculo) return { ok: false, error: "Vehículo no encontrado" };

  await prisma.vehiculo.update({
    where: { id },
    data: { estatus: estatus as any }
  });
  revalidatePath("/dashboard/flota");
  return { ok: true };
}

export async function registrarOdometro(id: string, odometroKm: number) {
  const sesion = await requireSesion();
  const vehiculo = await prisma.vehiculo.findFirst({ where: { id, empresaId: sesion.empresaId } });
  if (!vehiculo) return { ok: false, error: "Vehículo no encontrado" };

  await prisma.vehiculo.update({
    where: { id },
    data: { odometroKm }
  });
  revalidatePath(`/dashboard/flota/${id}`);
  return { ok: true };
}

export async function listarChoferes() {
  const sesion = await requireSesion();
  return prisma.chofer.findMany({
    where: { empresaId: sesion.empresaId },
    orderBy: { nombre: "asc" }
  });
}

export async function crearChofer(formData: FormData) {
  const sesion = await requireSesion();

  const parsed = choferSchema.safeParse({
    nombre: formData.get("nombre"),
    licencia: formData.get("licencia"),
    tipoLicencia: formData.get("tipoLicencia") || undefined,
    vigenciaLicencia: formData.get("vigenciaLicencia") || undefined,
    telefono: formData.get("telefono") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Datos inválidos" };
  }

  const data = parsed.data;

  await prisma.chofer.create({
    data: {
      empresaId: sesion.empresaId,
      nombre: data.nombre,
      licencia: data.licencia,
      tipoLicencia: data.tipoLicencia,
      vigenciaLicencia: data.vigenciaLicencia ? new Date(data.vigenciaLicencia) : null,
      telefono: data.telefono
    }
  });

  revalidatePath("/dashboard/flota");
  return { ok: true };
}

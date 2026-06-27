"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/session";
import { empleadoSchema, incidenciaSchema } from "@/lib/validations";

export async function listarEmpleados() {
  const sesion = await requireSesion();
  return prisma.empleado.findMany({
    where: { empresaId: sesion.empresaId },
    include: { chofer: true },
    orderBy: { nombre: "asc" }
  });
}

export async function crearEmpleado(formData: FormData) {
  const sesion = await requireSesion();

  const parsed = empleadoSchema.safeParse({
    nombre: formData.get("nombre"),
    puesto: formData.get("puesto"),
    departamento: formData.get("departamento") || "Operaciones",
    fechaIngreso: formData.get("fechaIngreso"),
    salarioMensual: formData.get("salarioMensual") || undefined,
    email: formData.get("email") || "",
    telefono: formData.get("telefono") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Datos inválidos" };
  }

  const data = parsed.data;

  await prisma.empleado.create({
    data: {
      empresaId: sesion.empresaId,
      nombre: data.nombre,
      puesto: data.puesto,
      departamento: data.departamento,
      fechaIngreso: new Date(data.fechaIngreso),
      salarioMensual: data.salarioMensual,
      email: data.email || null,
      telefono: data.telefono
    }
  });

  revalidatePath("/dashboard/rh");
  return { ok: true };
}

export async function darBajaEmpleado(id: string) {
  const sesion = await requireSesion();
  const empleado = await prisma.empleado.findFirst({ where: { id, empresaId: sesion.empresaId } });
  if (!empleado) return { ok: false, error: "No encontrado" };

  await prisma.empleado.update({
    where: { id },
    data: { estatus: "BAJA", fechaBaja: new Date() }
  });
  revalidatePath("/dashboard/rh");
  return { ok: true };
}

export async function listarIncidencias() {
  const sesion = await requireSesion();
  return prisma.incidencia.findMany({
    where: { empleado: { empresaId: sesion.empresaId } },
    include: { empleado: true },
    orderBy: { fechaInicio: "desc" }
  });
}

export async function crearIncidencia(formData: FormData) {
  const sesion = await requireSesion();

  const parsed = incidenciaSchema.safeParse({
    empleadoId: formData.get("empleadoId"),
    tipo: formData.get("tipo"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
    motivo: formData.get("motivo") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Datos inválidos" };
  }

  const data = parsed.data;

  const empleado = await prisma.empleado.findFirst({
    where: { id: data.empleadoId, empresaId: sesion.empresaId }
  });
  if (!empleado) return { ok: false, error: "Empleado no encontrado" };

  await prisma.incidencia.create({
    data: {
      empleadoId: data.empleadoId,
      tipo: data.tipo,
      fechaInicio: new Date(data.fechaInicio),
      fechaFin: new Date(data.fechaFin),
      motivo: data.motivo
    }
  });

  revalidatePath("/dashboard/rh/asistencia");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/session";
import { clienteFacturacionSchema } from "@/lib/validations";

export async function listarClientes() {
  const sesion = await requireSesion();
  return prisma.clienteFacturacion.findMany({
    where: { empresaId: sesion.empresaId },
    orderBy: { razonSocial: "asc" }
  });
}

export async function crearCliente(formData: FormData) {
  const sesion = await requireSesion();

  const parsed = clienteFacturacionSchema.safeParse({
    razonSocial: formData.get("razonSocial"),
    rfc: formData.get("rfc"),
    usoCfdi: formData.get("usoCfdi") || "G03",
    regimenFiscalReceptor: formData.get("regimenFiscalReceptor") || "616",
    codigoPostal: formData.get("codigoPostal"),
    email: formData.get("email") || "",
    telefono: formData.get("telefono") || undefined
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Datos inválidos" };
  }

  const data = parsed.data;

  await prisma.clienteFacturacion.create({
    data: {
      empresaId: sesion.empresaId,
      razonSocial: data.razonSocial,
      rfc: data.rfc.toUpperCase(),
      usoCfdi: data.usoCfdi,
      regimenFiscalReceptor: data.regimenFiscalReceptor,
      codigoPostal: data.codigoPostal,
      email: data.email || null,
      telefono: data.telefono
    }
  });

  revalidatePath("/dashboard/facturacion/clientes");
  return { ok: true };
}

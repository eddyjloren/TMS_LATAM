"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registroEmpresaSchema } from "@/lib/validations";

export type RegistroResultado = { ok: boolean; error?: string };

/**
 * Alta de una nueva empresa transportista (tenant) + su primer usuario ADMIN.
 * Crea automáticamente una suscripción en periodo de prueba (14 días) en el
 * plan BASICO.
 */
export async function registrarEmpresa(formData: FormData): Promise<RegistroResultado> {
  const parsed = registroEmpresaSchema.safeParse({
    empresaNombre: formData.get("empresaNombre"),
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Datos inválidos" };
  }

  const { empresaNombre, nombre, email, password } = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return { ok: false, error: "Ya existe una cuenta con ese email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let planBasico = await prisma.plan.findUnique({ where: { codigo: "BASICO" } });
  if (!planBasico) {
    planBasico = await prisma.plan.create({
      data: {
        codigo: "BASICO",
        nombre: "Básico",
        precioMensual: 990,
        limiteVehiculos: 10,
        limiteUsuarios: 3,
        limiteFacturasMes: 50,
        descripcion: "Ideal para flotillas pequeñas que están comenzando."
      }
    });
  }

  const fechaFinPrueba = new Date();
  fechaFinPrueba.setDate(fechaFinPrueba.getDate() + 14);

  await prisma.empresa.create({
    data: {
      nombre: empresaNombre,
      usuarios: {
        create: { nombre, email, passwordHash, rol: "ADMIN" }
      },
      suscripcion: {
        create: {
          planId: planBasico.id,
          estatus: "EN_PRUEBA",
          fechaFinPrueba
        }
      },
      seriesFiscales: {
        create: { serie: "A", ultimoFolio: 0 }
      }
    }
  });

  return { ok: true };
}

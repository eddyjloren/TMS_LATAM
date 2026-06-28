"use server";

import { prisma } from "@/lib/prisma";
import { requireSesion, requireRol } from "@/lib/session";

/** Lista todas las empresas registradas en la plataforma (multi-tenant), con su
 * suscripción/plan actual y métricas básicas de uso. Solo SUPER_ADMIN. */
export async function listarEmpresasPlataforma() {
  const sesion = await requireSesion();
  requireRol(sesion, ["SUPER_ADMIN"]);

  const empresas = await prisma.empresa.findMany({
    where: { id: { not: "plataforma-interna" } },
    orderBy: { createdAt: "desc" },
    include: {
      suscripcion: { include: { plan: true } },
      _count: {
        select: {
          usuarios: true,
          vehiculos: true,
          choferes: true,
          facturas: true,
          empleados: true
        }
      }
    }
  });

  return empresas;
}

/** Métricas globales de la plataforma para el resumen del panel Super Admin. */
export async function obtenerMetricasPlataforma() {
  const sesion = await requireSesion();
  requireRol(sesion, ["SUPER_ADMIN"]);

  const [
    totalEmpresas,
    empresasActivas,
    suscripcionesActivas,
    suscripcionesEnPrueba,
    totalVehiculos,
    totalFacturasTimbradas
  ] = await Promise.all([
    prisma.empresa.count({ where: { id: { not: "plataforma-interna" } } }),
    prisma.empresa.count({ where: { id: { not: "plataforma-interna" }, activa: true } }),
    prisma.suscripcion.count({ where: { estatus: "ACTIVA" } }),
    prisma.suscripcion.count({ where: { estatus: "EN_PRUEBA" } }),
    prisma.vehiculo.count(),
    prisma.factura.count({ where: { estatus: "TIMBRADA" } })
  ]);

  return {
    totalEmpresas,
    empresasActivas,
    suscripcionesActivas,
    suscripcionesEnPrueba,
    totalVehiculos,
    totalFacturasTimbradas
  };
}

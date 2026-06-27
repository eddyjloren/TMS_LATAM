"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/session";
import { facturaSchema } from "@/lib/validations";
import { calcularTotales, construirXmlCfdi } from "@/lib/cfdi";
import { obtenerPacAdapter } from "@/lib/pac";

export async function listarFacturas() {
  const sesion = await requireSesion();
  return prisma.factura.findMany({
    where: { empresaId: sesion.empresaId },
    include: { cliente: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function obtenerFactura(id: string) {
  const sesion = await requireSesion();
  return prisma.factura.findFirst({
    where: { id, empresaId: sesion.empresaId },
    include: { cliente: true, items: { include: { vehiculo: true } } }
  });
}

/**
 * Crea una factura en BORRADOR a partir de conceptos capturados en el
 * formulario. El timbrado (asignación de UUID fiscal) ocurre en un paso
 * separado vía timbrarFactura(), simulando el flujo real: primero se genera
 * el comprobante, luego se envía al PAC.
 */
export async function crearFacturaBorrador(input: {
  clienteId: string;
  formaPago: string;
  metodoPago: "PUE" | "PPD";
  items: { descripcion: string; vehiculoId?: string; cantidad: number; precioUnitario: number }[];
}) {
  const sesion = await requireSesion();

  const parsed = facturaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message || "Datos inválidos" };
  }
  const data = parsed.data;

  const cliente = await prisma.clienteFacturacion.findFirst({
    where: { id: data.clienteId, empresaId: sesion.empresaId }
  });
  if (!cliente) return { ok: false as const, error: "Cliente no encontrado" };

  const itemsConImporte = data.items.map((i) => ({
    ...i,
    importe: Math.round(i.cantidad * i.precioUnitario * 100) / 100
  }));
  const { subtotal, iva, total } = calcularTotales(itemsConImporte);

  const factura = await prisma.$transaction(async (tx) => {
    const serieFiscal = await tx.serieFiscal.upsert({
      where: { empresaId_serie: { empresaId: sesion.empresaId, serie: "A" } },
      update: { ultimoFolio: { increment: 1 } },
      create: { empresaId: sesion.empresaId, serie: "A", ultimoFolio: 1 }
    });

    return tx.factura.create({
      data: {
        empresaId: sesion.empresaId,
        clienteId: cliente.id,
        serie: serieFiscal.serie,
        folio: serieFiscal.ultimoFolio,
        subtotal,
        iva,
        total,
        formaPago: data.formaPago,
        metodoPago: data.metodoPago,
        estatus: "BORRADOR",
        items: {
          create: itemsConImporte.map((i) => ({
            descripcion: i.descripcion,
            vehiculoId: i.vehiculoId || null,
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
            importe: i.importe
          }))
        }
      }
    });
  });

  revalidatePath("/dashboard/facturacion");
  redirect(`/dashboard/facturacion/${factura.id}`);
}

/** Envía la factura BORRADOR al PAC (mock o real) para timbrarla. */
export async function timbrarFactura(facturaId: string) {
  const sesion = await requireSesion();

  const factura = await prisma.factura.findFirst({
    where: { id: facturaId, empresaId: sesion.empresaId },
    include: { cliente: true, items: true, empresa: true }
  });
  if (!factura) return { ok: false, error: "Factura no encontrada" };
  if (factura.estatus === "TIMBRADA") return { ok: false, error: "La factura ya está timbrada" };

  const xmlSinTimbrar = construirXmlCfdi({
    emisor: {
      rfc: factura.empresa.rfc || "XAXX010101000",
      nombre: factura.empresa.nombre,
      regimenFiscal: factura.empresa.regimenFiscal || "601"
    },
    receptor: {
      rfc: factura.cliente.rfc,
      nombre: factura.cliente.razonSocial,
      usoCfdi: factura.cliente.usoCfdi,
      regimenFiscalReceptor: factura.cliente.regimenFiscalReceptor,
      codigoPostal: factura.cliente.codigoPostal
    },
    serie: factura.serie,
    folio: factura.folio,
    fecha: new Date().toISOString().split(".")[0],
    formaPago: factura.formaPago,
    metodoPago: factura.metodoPago,
    moneda: factura.moneda,
    subtotal: Number(factura.subtotal),
    iva: Number(factura.iva),
    total: Number(factura.total),
    conceptos: factura.items.map((i) => ({
      claveProdServ: i.claveProdServ,
      claveUnidad: i.claveUnidad,
      descripcion: i.descripcion,
      cantidad: Number(i.cantidad),
      precioUnitario: Number(i.precioUnitario),
      importe: Number(i.importe)
    }))
  });

  try {
    const pac = obtenerPacAdapter();
    const resultado = await pac.timbrar(xmlSinTimbrar);

    await prisma.factura.update({
      where: { id: factura.id },
      data: {
        estatus: "TIMBRADA",
        uuidFiscal: resultado.uuid,
        xmlCfdi: resultado.xmlTimbrado,
        selloDigital: resultado.selloDigital,
        fechaTimbrado: new Date(resultado.fechaTimbrado),
        pacUsado: resultado.pacUsado
      }
    });
  } catch (error) {
    await prisma.factura.update({
      where: { id: factura.id },
      data: { estatus: "ERROR_TIMBRADO" }
    });
    return { ok: false, error: "Error al timbrar con el PAC. Intenta de nuevo." };
  }

  revalidatePath(`/dashboard/facturacion/${facturaId}`);
  revalidatePath("/dashboard/facturacion");
  return { ok: true };
}

export async function cancelarFactura(facturaId: string, motivo: string) {
  const sesion = await requireSesion();
  const factura = await prisma.factura.findFirst({ where: { id: facturaId, empresaId: sesion.empresaId } });
  if (!factura) return { ok: false, error: "Factura no encontrada" };

  if (factura.uuidFiscal) {
    const pac = obtenerPacAdapter();
    await pac.cancelar(factura.uuidFiscal, motivo);
  }

  await prisma.factura.update({
    where: { id: facturaId },
    data: { estatus: "CANCELADA", motivoCancelacion: motivo }
  });

  revalidatePath(`/dashboard/facturacion/${facturaId}`);
  revalidatePath("/dashboard/facturacion");
  return { ok: true };
}

import { create } from "xmlbuilder2";

/**
 * Generación de CFDI 4.0 (Comprobante Fiscal Digital por Internet).
 *
 * IMPORTANTE - límites legales de "open source" en facturación electrónica MX:
 * - Construir el XML del CFDI sí puede hacerse 100% con herramientas open
 *   source (como aquí, con xmlbuilder2). Eso es lo que hace esta función.
 * - El SELLADO con el Certificado de Sello Digital (CSD) del emisor y el
 *   TIMBRADO (asignar el UUID/folio fiscal validado por el SAT) NO pueden
 *   hacerse de forma independiente: la ley exige que el timbrado lo realice
 *   un PAC (Proveedor Autorizado de Certificación) autorizado por el SAT.
 *   No existe un "PAC open source" porque es un servicio regulado.
 * - Por eso este módulo separa: (1) construir el XML "por timbrar" aquí
 *   mismo, sin depender de nadie, y (2) enviarlo a un PAC plugable
 *   (ver src/lib/pac.ts) que en desarrollo corre en modo MOCK gratuito.
 */

export type ConceptoCfdi = {
  claveProdServ: string;
  claveUnidad: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
};

export type DatosCfdi = {
  emisor: { rfc: string; nombre: string; regimenFiscal: string };
  receptor: {
    rfc: string;
    nombre: string;
    usoCfdi: string;
    regimenFiscalReceptor: string;
    codigoPostal: string;
  };
  serie: string;
  folio: number;
  fecha: string; // ISO sin zona, formato CFDI: YYYY-MM-DDThh:mm:ss
  formaPago: string;
  metodoPago: string;
  moneda: string;
  subtotal: number;
  iva: number;
  total: number;
  conceptos: ConceptoCfdi[];
};

/** Construye el XML del CFDI 4.0 "por timbrar" (sin sello ni folio fiscal todavía). */
export function construirXmlCfdi(datos: DatosCfdi): string {
  const doc = create({ version: "1.0", encoding: "UTF-8" })
    .ele("cfdi:Comprobante", {
      "xmlns:cfdi": "http://www.sat.gob.mx/cfd/4",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xsi:schemaLocation":
        "http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd",
      Version: "4.0",
      Serie: datos.serie,
      Folio: String(datos.folio),
      Fecha: datos.fecha,
      Sello: "", // lo asigna el PAC al timbrar
      FormaPago: datos.formaPago,
      NoCertificado: "",
      Certificado: "",
      SubTotal: datos.subtotal.toFixed(2),
      Moneda: datos.moneda,
      Total: datos.total.toFixed(2),
      TipoDeComprobante: "I",
      MetodoPago: datos.metodoPago,
      LugarExpedicion: datos.receptor.codigoPostal,
      Exportacion: "01"
    });

  doc
    .ele("cfdi:Emisor", {
      Rfc: datos.emisor.rfc,
      Nombre: datos.emisor.nombre,
      RegimenFiscal: datos.emisor.regimenFiscal
    })
    .up();

  doc
    .ele("cfdi:Receptor", {
      Rfc: datos.receptor.rfc,
      Nombre: datos.receptor.nombre,
      DomicilioFiscalReceptor: datos.receptor.codigoPostal,
      RegimenFiscalReceptor: datos.receptor.regimenFiscalReceptor,
      UsoCFDI: datos.receptor.usoCfdi
    })
    .up();

  const conceptos = doc.ele("cfdi:Conceptos");
  for (const c of datos.conceptos) {
    conceptos.ele("cfdi:Concepto", {
      ClaveProdServ: c.claveProdServ,
      ClaveUnidad: c.claveUnidad,
      Cantidad: String(c.cantidad),
      Descripcion: c.descripcion,
      ValorUnitario: c.precioUnitario.toFixed(2),
      Importe: c.importe.toFixed(2),
      ObjetoImp: "02"
    });
  }
  conceptos.up();

  const impuestos = doc.ele("cfdi:Impuestos", { TotalImpuestosTrasladados: datos.iva.toFixed(2) });
  const traslados = impuestos.ele("cfdi:Traslados");
  traslados.ele("cfdi:Traslado", {
    Base: datos.subtotal.toFixed(2),
    Impuesto: "002",
    TipoFactor: "Tasa",
    TasaOCuota: "0.160000",
    Importe: datos.iva.toFixed(2)
  });

  return doc.end({ prettyPrint: true });
}

/** Calcula subtotal, IVA (16%) y total a partir de los conceptos de la factura. */
export function calcularTotales(conceptos: { cantidad: number; precioUnitario: number }[]) {
  const subtotal = conceptos.reduce((acc, c) => acc + c.cantidad * c.precioUnitario, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    iva: Math.round(iva * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

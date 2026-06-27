import { randomUUID } from "crypto";

/**
 * Adaptador PAC (Proveedor Autorizado de Certificación) - plugable.
 *
 * El timbrado fiscal real ante el SAT requiere contratar un PAC autorizado
 * (no existe alternativa open source: es un servicio regulado). Este archivo
 * define una interfaz común para que, el día que la empresa contrate un PAC,
 * solo se necesite implementar un nuevo adaptador (ver ejemplos comentados
 * abajo) sin tocar el resto del sistema.
 *
 * Por defecto (PAC_PROVIDER=mock) se usa un timbrador simulado: genera un
 * UUID y un sello falso, suficiente para desarrollar y probar todo el flujo
 * de facturación sin costo y sin contrato con ningún proveedor.
 */

export type ResultadoTimbrado = {
  uuid: string;
  selloDigital: string;
  fechaTimbrado: string;
  xmlTimbrado: string;
  pacUsado: string;
};

export interface PacAdapter {
  timbrar(xmlSinTimbrar: string): Promise<ResultadoTimbrado>;
  cancelar(uuid: string, motivo: string): Promise<{ cancelado: boolean }>;
}

class MockPacAdapter implements PacAdapter {
  async timbrar(xmlSinTimbrar: string): Promise<ResultadoTimbrado> {
    const uuid = randomUUID().toUpperCase();
    const selloDigital = Buffer.from(`MOCK-SELLO-${uuid}`).toString("base64");
    const fechaTimbrado = new Date().toISOString().split(".")[0];

    // Inserta el "Complemento TimbreFiscalDigital" simulado dentro del XML
    // para que el documento final tenga la forma de un CFDI ya timbrado.
    const xmlTimbrado = xmlSinTimbrar.replace(
      "</cfdi:Comprobante>",
      `  <cfdi:Complemento>\n` +
        `    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" ` +
        `Version="1.1" UUID="${uuid}" FechaTimbrado="${fechaTimbrado}" ` +
        `SelloCFD="${selloDigital}" NoCertificadoSAT="MOCK00000000000000" SelloSAT="${selloDigital}" />\n` +
        `  </cfdi:Complemento>\n</cfdi:Comprobante>`
    );

    return { uuid, selloDigital, fechaTimbrado, xmlTimbrado, pacUsado: "MOCK (modo desarrollo)" };
  }

  async cancelar(_uuid: string, _motivo: string) {
    return { cancelado: true };
  }
}

/*
 * Ejemplo de cómo se vería un adaptador real (Facturama, a modo de referencia,
 * no incluido por defecto porque requiere credenciales y conexión a internet):
 *
 * class FacturamaPacAdapter implements PacAdapter {
 *   async timbrar(xmlSinTimbrar: string) {
 *     const res = await fetch(`${process.env.PAC_API_URL}/api/2/cfdi40`, {
 *       method: "POST",
 *       headers: {
 *         Authorization: `Basic ${Buffer.from(
 *           `${process.env.PAC_API_USER}:${process.env.PAC_API_PASSWORD}`
 *         ).toString("base64")}`,
 *         "Content-Type": "application/json"
 *       },
 *       body: JSON.stringify({ xml: xmlSinTimbrar })
 *     });
 *     const data = await res.json();
 *     return {
 *       uuid: data.Id,
 *       selloDigital: data.Sello,
 *       fechaTimbrado: data.Fecha,
 *       xmlTimbrado: Buffer.from(data.Content, "base64").toString("utf-8"),
 *       pacUsado: "Facturama"
 *     };
 *   }
 *   async cancelar(uuid: string, motivo: string) { ... }
 * }
 */

export function obtenerPacAdapter(): PacAdapter {
  const proveedor = process.env.PAC_PROVIDER || "mock";

  switch (proveedor) {
    case "mock":
    default:
      // Aquí se conectaría el adaptador real cuando exista contrato con un PAC.
      return new MockPacAdapter();
  }
}

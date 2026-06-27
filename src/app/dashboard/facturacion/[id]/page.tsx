import { notFound } from "next/navigation";
import { obtenerFactura } from "@/actions/facturas";
import { formatoFecha, formatoMoneda } from "@/lib/utils";
import { AccionesFactura } from "@/components/AccionesFactura";

const ESTATUS_COLOR: Record<string, string> = {
  BORRADOR: "bg-slate-100 text-slate-600",
  TIMBRADA: "bg-green-100 text-green-700",
  CANCELADA: "bg-red-100 text-red-700",
  ERROR_TIMBRADO: "bg-amber-100 text-amber-700"
};

export default async function FacturaDetallePage({ params }: { params: { id: string } }) {
  const factura = await obtenerFactura(params.id);
  if (!factura) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Factura {factura.serie}-{factura.folio}
          </h2>
          <p className="text-sm text-slate-500">{factura.cliente.razonSocial} · RFC {factura.cliente.rfc}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTATUS_COLOR[factura.estatus]}`}>
          {factura.estatus.replace("_", " ")}
        </span>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2">Concepto</th>
              <th className="py-2">Unidad</th>
              <th className="py-2">Cant.</th>
              <th className="py-2">Precio</th>
              <th className="py-2">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {factura.items.map((i) => (
              <tr key={i.id}>
                <td className="py-2">{i.descripcion}</td>
                <td className="py-2">{i.vehiculo?.numeroEconomico || "—"}</td>
                <td className="py-2">{Number(i.cantidad)}</td>
                <td className="py-2">{formatoMoneda(Number(i.precioUnitario))}</td>
                <td className="py-2">{formatoMoneda(Number(i.importe))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 ml-auto w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span>{formatoMoneda(Number(factura.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">IVA</span>
            <span>{formatoMoneda(Number(factura.iva))}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatoMoneda(Number(factura.total))}</span>
          </div>
        </div>
      </div>

      <div className="card space-y-2 text-sm">
        <h3 className="text-base font-semibold text-slate-900">Datos fiscales</h3>
        <p>
          <span className="text-slate-500">UUID fiscal:</span>{" "}
          <span className="font-mono">{factura.uuidFiscal || "Aún no timbrada"}</span>
        </p>
        <p>
          <span className="text-slate-500">Fecha de timbrado:</span> {formatoFecha(factura.fechaTimbrado)}
        </p>
        <p>
          <span className="text-slate-500">PAC:</span> {factura.pacUsado || "—"}
        </p>
        {factura.motivoCancelacion && (
          <p>
            <span className="text-slate-500">Motivo de cancelación:</span> {factura.motivoCancelacion}
          </p>
        )}
      </div>

      <AccionesFactura id={factura.id} estatus={factura.estatus} />
    </div>
  );
}

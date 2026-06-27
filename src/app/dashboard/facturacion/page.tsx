import Link from "next/link";
import { listarFacturas } from "@/actions/facturas";
import { formatoFecha, formatoMoneda } from "@/lib/utils";

const ESTATUS_COLOR: Record<string, string> = {
  BORRADOR: "bg-slate-100 text-slate-600",
  TIMBRADA: "bg-green-100 text-green-700",
  CANCELADA: "bg-red-100 text-red-700",
  ERROR_TIMBRADO: "bg-amber-100 text-amber-700"
};

export default async function FacturacionPage() {
  const facturas = await listarFacturas();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Facturación</h2>
        <Link href="/dashboard/facturacion/nueva" className="btn-primary">
          + Nueva factura
        </Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">UUID</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {facturas.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {f.serie}-{f.folio}
                </td>
                <td className="px-4 py-3">{f.cliente.razonSocial}</td>
                <td className="px-4 py-3">{formatoMoneda(Number(f.total))}</td>
                <td className="px-4 py-3">{formatoFecha(f.createdAt)}</td>
                <td className="px-4 py-3 font-mono text-xs">{f.uuidFiscal ? f.uuidFiscal.slice(0, 8) + "…" : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTATUS_COLOR[f.estatus]}`}>
                    {f.estatus.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/facturacion/${f.id}`} className="font-medium text-brand-600 hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {facturas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Aún no has generado facturas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

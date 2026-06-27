import { notFound } from "next/navigation";
import { obtenerVehiculo } from "@/actions/vehiculos";
import { formatoFecha, formatoKm, formatoMoneda } from "@/lib/utils";
import { AccionesMantenimiento } from "@/components/AccionesMantenimiento";
import { MantenimientoForm } from "@/components/forms/MantenimientoForm";

const ESTATUS_MANT: Record<string, string> = {
  PROGRAMADO: "bg-amber-100 text-amber-700",
  EN_PROCESO: "bg-blue-100 text-blue-700",
  COMPLETADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-slate-100 text-slate-500"
};

export default async function VehiculoDetallePage({ params }: { params: { id: string } }) {
  const vehiculo = await obtenerVehiculo(params.id);
  if (!vehiculo) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          {vehiculo.numeroEconomico} — {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})
        </h2>
        <p className="text-sm text-slate-500">Placas: {vehiculo.placas}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Odómetro actual</p>
          <p className="text-xl font-bold text-slate-900">{formatoKm(Number(vehiculo.odometroKm))}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Chofer asignado</p>
          <p className="text-xl font-bold text-slate-900">{vehiculo.choferAsignado?.nombre || "Sin asignar"}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Vigencia de seguro</p>
          <p className="text-xl font-bold text-slate-900">{formatoFecha(vehiculo.vigenciaSeguro)}</p>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-base font-semibold text-slate-900">Historial de mantenimiento</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Programado</th>
              <th className="px-4 py-3">Realizado</th>
              <th className="px-4 py-3">Costo</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehiculo.mantenimientos.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3">{m.tipo}</td>
                <td className="px-4 py-3">{m.descripcion}</td>
                <td className="px-4 py-3">
                  {m.fechaProgramada ? formatoFecha(m.fechaProgramada) : ""}
                  {m.kmProgramado ? ` · ${formatoKm(Number(m.kmProgramado))}` : ""}
                </td>
                <td className="px-4 py-3">{m.fechaRealizado ? formatoFecha(m.fechaRealizado) : "—"}</td>
                <td className="px-4 py-3">{m.costo ? formatoMoneda(Number(m.costo)) : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTATUS_MANT[m.estatus]}`}>
                    {m.estatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {m.estatus === "PROGRAMADO" && (
                    <AccionesMantenimiento id={m.id} odometroActual={Number(vehiculo.odometroKm)} />
                  )}
                </td>
              </tr>
            ))}
            {vehiculo.mantenimientos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Sin mantenimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MantenimientoForm vehiculos={[{ id: vehiculo.id, numeroEconomico: vehiculo.numeroEconomico }]} />
    </div>
  );
}

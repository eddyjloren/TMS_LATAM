import { listarMantenimientos } from "@/actions/mantenimientos";
import { listarVehiculos } from "@/actions/vehiculos";
import { formatoFecha, formatoKm, formatoMoneda } from "@/lib/utils";
import { AccionesMantenimiento } from "@/components/AccionesMantenimiento";
import { MantenimientoForm } from "@/components/forms/MantenimientoForm";

const ESTATUS_MANT: Record<string, string> = {
  PROGRAMADO: "bg-amber-100 text-amber-700",
  EN_PROCESO: "bg-blue-100 text-blue-700",
  COMPLETADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-slate-100 text-slate-500"
};

export default async function MantenimientoPage() {
  const [mantenimientos, vehiculos] = await Promise.all([listarMantenimientos(), listarVehiculos()]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Mantenimiento</h2>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Unidad</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Programado</th>
              <th className="px-4 py-3">Costo</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mantenimientos.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{m.vehiculo.numeroEconomico}</td>
                <td className="px-4 py-3">{m.tipo}</td>
                <td className="px-4 py-3">{m.descripcion}</td>
                <td className="px-4 py-3">
                  {m.fechaProgramada ? formatoFecha(m.fechaProgramada) : ""}
                  {m.kmProgramado ? ` · ${formatoKm(Number(m.kmProgramado))}` : ""}
                </td>
                <td className="px-4 py-3">{m.costo ? formatoMoneda(Number(m.costo)) : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTATUS_MANT[m.estatus]}`}>
                    {m.estatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {m.estatus === "PROGRAMADO" && (
                    <AccionesMantenimiento id={m.id} odometroActual={Number(m.vehiculo.odometroKm)} />
                  )}
                </td>
              </tr>
            ))}
            {mantenimientos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Sin mantenimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MantenimientoForm vehiculos={vehiculos.map((v) => ({ id: v.id, numeroEconomico: v.numeroEconomico }))} />
    </div>
  );
}

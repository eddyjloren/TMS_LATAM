import { listarIncidencias, listarEmpleados } from "@/actions/rh";
import { formatoFecha } from "@/lib/utils";
import { IncidenciaForm } from "@/components/forms/IncidenciaForm";

const TIPO_COLOR: Record<string, string> = {
  FALTA: "bg-red-100 text-red-700",
  VACACIONES: "bg-blue-100 text-blue-700",
  PERMISO: "bg-slate-100 text-slate-600",
  INCAPACIDAD: "bg-amber-100 text-amber-700",
  RETARDO: "bg-orange-100 text-orange-700"
};

export default async function AsistenciaPage() {
  const [incidencias, empleados] = await Promise.all([listarIncidencias(), listarEmpleados()]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Asistencia e Incidencias</h2>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Empleado</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Del</th>
              <th className="px-4 py-3">Al</th>
              <th className="px-4 py-3">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidencias.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{i.empleado.nombre}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TIPO_COLOR[i.tipo]}`}>{i.tipo}</span>
                </td>
                <td className="px-4 py-3">{formatoFecha(i.fechaInicio)}</td>
                <td className="px-4 py-3">{formatoFecha(i.fechaFin)}</td>
                <td className="px-4 py-3">{i.motivo || "—"}</td>
              </tr>
            ))}
            {incidencias.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Sin incidencias registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <IncidenciaForm empleados={empleados.map((e) => ({ id: e.id, nombre: e.nombre }))} />
    </div>
  );
}

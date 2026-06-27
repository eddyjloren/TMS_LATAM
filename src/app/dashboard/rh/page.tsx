import { listarEmpleados } from "@/actions/rh";
import { formatoFecha, formatoMoneda } from "@/lib/utils";
import { EmpleadoForm } from "@/components/forms/EmpleadoForm";
import { BotonBajaEmpleado } from "@/components/BotonBajaEmpleado";

export default async function RhPage() {
  const empleados = await listarEmpleados();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Recursos Humanos</h2>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Puesto</th>
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Salario</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {empleados.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {e.nombre}
                  {e.chofer && <span className="ml-2 rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">Chofer</span>}
                </td>
                <td className="px-4 py-3">{e.puesto}</td>
                <td className="px-4 py-3">{e.departamento}</td>
                <td className="px-4 py-3">{formatoFecha(e.fechaIngreso)}</td>
                <td className="px-4 py-3">{e.salarioMensual ? formatoMoneda(Number(e.salarioMensual)) : "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      e.estatus === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {e.estatus}
                  </span>
                </td>
                <td className="px-4 py-3">{e.estatus === "ACTIVO" && <BotonBajaEmpleado id={e.id} />}</td>
              </tr>
            ))}
            {empleados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Sin empleados registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EmpleadoForm />
    </div>
  );
}

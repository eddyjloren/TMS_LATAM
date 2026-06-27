import Link from "next/link";
import { listarVehiculos, listarChoferes } from "@/actions/vehiculos";
import { formatoFecha, formatoKm, diasRestantes } from "@/lib/utils";
import { ChoferForm } from "@/components/forms/ChoferForm";

const ESTATUS_COLOR: Record<string, string> = {
  DISPONIBLE: "bg-green-100 text-green-700",
  EN_RUTA: "bg-blue-100 text-blue-700",
  EN_MANTENIMIENTO: "bg-amber-100 text-amber-700",
  FUERA_DE_SERVICIO: "bg-red-100 text-red-700"
};

export default async function FlotaPage() {
  const [vehiculos, choferes] = await Promise.all([listarVehiculos(), listarChoferes()]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Control de Flota</h2>
        <Link href="/dashboard/flota/nuevo" className="btn-primary">
          + Nuevo vehículo
        </Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Unidad</th>
              <th className="px-4 py-3">Placas</th>
              <th className="px-4 py-3">Chofer</th>
              <th className="px-4 py-3">Odómetro</th>
              <th className="px-4 py-3">Seguro</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehiculos.map((v) => {
              const dias = diasRestantes(v.vigenciaSeguro);
              return (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {v.numeroEconomico}
                    <div className="text-xs text-slate-500">
                      {v.marca} {v.modelo} {v.anio}
                    </div>
                  </td>
                  <td className="px-4 py-3">{v.placas}</td>
                  <td className="px-4 py-3">{v.choferAsignado?.nombre || "—"}</td>
                  <td className="px-4 py-3">{formatoKm(Number(v.odometroKm))}</td>
                  <td className="px-4 py-3">
                    {v.vigenciaSeguro ? (
                      <span className={dias !== null && dias < 15 ? "text-red-600" : "text-slate-600"}>
                        {formatoFecha(v.vigenciaSeguro)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTATUS_COLOR[v.estatus]}`}>
                      {v.estatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/flota/${v.id}`} className="font-medium text-brand-600 hover:underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
            {vehiculos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Aún no tienes vehículos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Choferes</h3>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Licencia</th>
                <th className="px-4 py-3">Vigencia</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {choferes.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.nombre}</td>
                  <td className="px-4 py-3">{c.licencia}</td>
                  <td className="px-4 py-3">{formatoFecha(c.vigenciaLicencia)}</td>
                  <td className="px-4 py-3">{c.telefono || "—"}</td>
                  <td className="px-4 py-3">{c.estatus}</td>
                </tr>
              ))}
              {choferes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Sin choferes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ChoferForm />
      </div>
    </div>
  );
}

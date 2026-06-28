import { listarEmpresasPlataforma, obtenerMetricasPlataforma } from "@/actions/admin-plataforma";
import { formatoFecha } from "@/lib/utils";

const ESTATUS_LABEL: Record<string, { texto: string; color: string }> = {
  EN_PRUEBA: { texto: "En prueba", color: "bg-blue-100 text-blue-700" },
  ACTIVA: { texto: "Activa", color: "bg-green-100 text-green-700" },
  PAGO_PENDIENTE: { texto: "Pago pendiente", color: "bg-amber-100 text-amber-700" },
  SUSPENDIDA: { texto: "Suspendida", color: "bg-red-100 text-red-700" },
  CANCELADA: { texto: "Cancelada", color: "bg-slate-100 text-slate-500" }
};

export default async function AdminPlataformaPage() {
  const [empresas, metricas] = await Promise.all([listarEmpresasPlataforma(), obtenerMetricasPlataforma()]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Panel Super Admin</h2>
        <p className="text-sm text-slate-500">Vista global de todas las empresas registradas en la plataforma.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Metrica label="Empresas" valor={metricas.totalEmpresas} />
        <Metrica label="Activas" valor={metricas.empresasActivas} />
        <Metrica label="Suscripciones activas" valor={metricas.suscripcionesActivas} />
        <Metrica label="En prueba" valor={metricas.suscripcionesEnPrueba} />
        <Metrica label="Vehículos (total)" valor={metricas.totalVehiculos} />
        <Metrica label="Facturas timbradas" valor={metricas.totalFacturasTimbradas} />
      </div>

      <div className="card overflow-x-auto">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Empresas registradas</h3>
        <table className="w-full min-w-[900px] text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2">Empresa</th>
              <th className="py-2">RFC</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Estatus susc.</th>
              <th className="py-2">Próx. cobro</th>
              <th className="py-2">Usuarios</th>
              <th className="py-2">Vehículos</th>
              <th className="py-2">Facturas</th>
              <th className="py-2">Empleados</th>
              <th className="py-2">Registrada</th>
              <th className="py-2">Activa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {empresas.map((empresa) => {
              const estatus = empresa.suscripcion ? ESTATUS_LABEL[empresa.suscripcion.estatus] : null;
              return (
                <tr key={empresa.id}>
                  <td className="py-2 font-medium text-slate-900">{empresa.nombre}</td>
                  <td className="py-2">{empresa.rfc ?? "—"}</td>
                  <td className="py-2">{empresa.suscripcion?.plan.nombre ?? "—"}</td>
                  <td className="py-2">
                    {estatus ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${estatus.color}`}>
                        {estatus.texto}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2">{formatoFecha(empresa.suscripcion?.fechaProximoCobro)}</td>
                  <td className="py-2">{empresa._count.usuarios}</td>
                  <td className="py-2">{empresa._count.vehiculos}</td>
                  <td className="py-2">{empresa._count.facturas}</td>
                  <td className="py-2">{empresa._count.empleados}</td>
                  <td className="py-2">{formatoFecha(empresa.createdAt)}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        empresa.activa ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {empresa.activa ? "Sí" : "No"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {empresas.length === 0 && (
              <tr>
                <td colSpan={11} className="py-6 text-center text-slate-500">
                  Todavía no hay empresas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metrica({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="card">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{valor}</p>
    </div>
  );
}

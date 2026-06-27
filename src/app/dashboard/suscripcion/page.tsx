import { obtenerSuscripcion, listarPlanes } from "@/actions/suscripcion";
import { formatoFecha, formatoMoneda } from "@/lib/utils";
import { BotonCambiarPlan, BotonRegistrarPago } from "@/components/AccionesSuscripcion";

const ESTATUS_LABEL: Record<string, { texto: string; color: string }> = {
  EN_PRUEBA: { texto: "En periodo de prueba", color: "bg-blue-100 text-blue-700" },
  ACTIVA: { texto: "Activa", color: "bg-green-100 text-green-700" },
  PAGO_PENDIENTE: { texto: "Pago pendiente", color: "bg-amber-100 text-amber-700" },
  SUSPENDIDA: { texto: "Suspendida", color: "bg-red-100 text-red-700" },
  CANCELADA: { texto: "Cancelada", color: "bg-slate-100 text-slate-500" }
};

export default async function SuscripcionPage() {
  const [suscripcion, planes] = await Promise.all([obtenerSuscripcion(), listarPlanes()]);

  if (!suscripcion) {
    return <p className="text-sm text-slate-500">No se encontró información de suscripción.</p>;
  }

  const estatus = ESTATUS_LABEL[suscripcion.estatus];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-slate-900">Suscripción</h2>

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Plan actual</p>
          <p className="text-2xl font-bold text-slate-900">{suscripcion.plan.nombre}</p>
          <p className="text-sm text-slate-500">{formatoMoneda(Number(suscripcion.plan.precioMensual))} / mes</p>
        </div>
        <div className="text-right">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estatus.color}`}>{estatus.texto}</span>
          {suscripcion.fechaFinPrueba && suscripcion.estatus === "EN_PRUEBA" && (
            <p className="mt-2 text-xs text-slate-500">Termina: {formatoFecha(suscripcion.fechaFinPrueba)}</p>
          )}
          {suscripcion.fechaProximoCobro && (
            <p className="mt-2 text-xs text-slate-500">Próximo cobro: {formatoFecha(suscripcion.fechaProximoCobro)}</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold text-slate-900">Planes disponibles</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {planes.map((p) => (
            <div key={p.id} className="card flex flex-col">
              <p className="text-lg font-semibold text-slate-900">{p.nombre}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatoMoneda(Number(p.precioMensual))}
                <span className="text-sm font-normal text-slate-500">/mes</span>
              </p>
              <ul className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
                <li>Hasta {p.limiteVehiculos} vehículos</li>
                <li>Hasta {p.limiteUsuarios} usuarios</li>
                <li>{p.limiteFacturasMes} facturas/mes</li>
                {p.incluyeRH && <li>Módulo de RH incluido</li>}
              </ul>
              <div className="mt-4">
                <BotonCambiarPlan planId={p.id} esActual={p.id === suscripcion.planId} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Historial de pagos</h3>
          <BotonRegistrarPago montoSugerido={Number(suscripcion.plan.precioMensual)} />
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2">Periodo</th>
              <th className="py-2">Monto</th>
              <th className="py-2">Estatus</th>
              <th className="py-2">Pagado el</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suscripcion.pagos.map((pago) => (
              <tr key={pago.id}>
                <td className="py-2">
                  {formatoFecha(pago.periodoInicio)} – {formatoFecha(pago.periodoFin)}
                </td>
                <td className="py-2">{formatoMoneda(Number(pago.monto))}</td>
                <td className="py-2">{pago.estatus}</td>
                <td className="py-2">{pago.pagadoEn ? formatoFecha(pago.pagadoEn) : "—"}</td>
              </tr>
            ))}
            {suscripcion.pagos.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">
                  Sin pagos registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="text-xs text-slate-400">
          Nota: el cobro automático con tarjeta requiere conectar un procesador de pagos real (ej. Stripe) —
          ver <code className="rounded bg-slate-100 px-1">src/lib/billing.ts</code>. Por ahora los pagos se
          registran manualmente.
        </p>
      </div>
    </div>
  );
}

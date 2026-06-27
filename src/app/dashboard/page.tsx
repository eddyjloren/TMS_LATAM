import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/session";
import { StatCard } from "@/components/StatCard";
import { listarAlertasMantenimiento } from "@/actions/mantenimientos";
import { formatoFecha, formatoKm, formatoMoneda } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const sesion = await requireSesion();

  const [totalVehiculos, vehiculosEnRuta, empleadosActivos, facturasMes, suscripcion, alertas] =
    await Promise.all([
      prisma.vehiculo.count({ where: { empresaId: sesion.empresaId } }),
      prisma.vehiculo.count({ where: { empresaId: sesion.empresaId, estatus: "EN_RUTA" } }),
      prisma.empleado.count({ where: { empresaId: sesion.empresaId, estatus: "ACTIVO" } }),
      prisma.factura.aggregate({
        where: {
          empresaId: sesion.empresaId,
          estatus: "TIMBRADA",
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        },
        _sum: { total: true },
        _count: true
      }),
      prisma.suscripcion.findUnique({ where: { empresaId: sesion.empresaId }, include: { plan: true } }),
      listarAlertasMantenimiento()
    ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard titulo="Vehículos totales" valor={totalVehiculos} subtitulo={`${vehiculosEnRuta} en ruta`} />
        <StatCard
          titulo="Facturación del mes"
          valor={formatoMoneda(Number(facturasMes._sum.total || 0))}
          subtitulo={`${facturasMes._count} facturas timbradas`}
        />
        <StatCard titulo="Empleados activos" valor={empleadosActivos} />
        <StatCard
          titulo="Suscripción"
          valor={suscripcion?.plan.nombre || "Sin plan"}
          subtitulo={`Estatus: ${suscripcion?.estatus || "—"}`}
          alerta={suscripcion?.estatus === "PAGO_PENDIENTE" || suscripcion?.estatus === "SUSPENDIDA"}
        />
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Alertas de mantenimiento</h2>
          <Link href="/dashboard/mantenimiento" className="text-sm font-medium text-brand-600 hover:underline">
            Ver todos
          </Link>
        </div>
        {alertas.length === 0 ? (
          <p className="text-sm text-slate-500">No hay mantenimientos próximos a vencer. 🎉</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {alertas.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">
                    {a.vehiculo.numeroEconomico} — {a.descripcion}
                  </p>
                  <p className="text-slate-500">
                    {a.fechaProgramada ? `Programado: ${formatoFecha(a.fechaProgramada)}` : ""}
                    {a.kmProgramado ? ` · Km objetivo: ${formatoKm(Number(a.kmProgramado))}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Próximo
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

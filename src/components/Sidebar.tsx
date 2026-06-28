import Link from "next/link";
import type { SesionTms } from "@/lib/session";

const ENLACES = [
  { href: "/dashboard", label: "Resumen", icono: "📊" },
  { href: "/dashboard/flota", label: "Control de Flota", icono: "🚛" },
  { href: "/dashboard/mantenimiento", label: "Mantenimiento", icono: "🔧" },
  { href: "/dashboard/facturacion", label: "Facturación", icono: "🧾" },
  { href: "/dashboard/facturacion/clientes", label: "Clientes", icono: "🏢" },
  { href: "/dashboard/rh", label: "Recursos Humanos", icono: "👥" },
  { href: "/dashboard/rh/asistencia", label: "Asistencia / Incidencias", icono: "🗓️" },
  { href: "/dashboard/suscripcion", label: "Suscripción", icono: "💳" }
];

const ENLACE_SUPER_ADMIN = { href: "/dashboard/admin-plataforma", label: "Panel Super Admin", icono: "🛡️" };

export function Sidebar({ sesion }: { sesion?: SesionTms }) {
  const enlaces = sesion?.rol === "SUPER_ADMIN" ? [...ENLACES, ENLACE_SUPER_ADMIN] : ENLACES;

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="px-5 py-5">
        <Link href="/" className="text-lg font-bold text-brand-700">
          TMS<span className="text-slate-900">LATAM</span>
        </Link>
      </div>
      <nav className="space-y-1 px-3">
        {enlaces.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
          >
            <span>{enlace.icono}</span>
            {enlace.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

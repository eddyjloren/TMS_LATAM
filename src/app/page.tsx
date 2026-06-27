import Link from "next/link";

const MODULOS = [
  {
    titulo: "Control de Flota",
    desc: "Da de alta tus unidades, choferes y documentos. Monitorea estatus, odómetro, seguros y permisos con alertas de vencimiento.",
    icono: "🚛"
  },
  {
    titulo: "Facturación",
    desc: "Genera facturas a tus clientes con conceptos de servicio de transporte, control de folios y reportes de cobranza.",
    icono: "🧾"
  },
  {
    titulo: "Timbrado de Facturas (CFDI)",
    desc: "Construcción de CFDI 4.0 y timbrado conectable a tu PAC autorizado por el SAT. Cancelaciones y reenvío incluidos.",
    icono: "✅"
  },
  {
    titulo: "Mantenimientos integrados",
    desc: "Programa mantenimiento preventivo por kilometraje o fecha, registra correctivos y consulta el historial por unidad.",
    icono: "🔧"
  },
  {
    titulo: "Módulo de RH",
    desc: "Expedientes de empleados, asistencia, incidencias, vacaciones y vínculo directo con choferes de la flota.",
    icono: "👥"
  },
  {
    titulo: "100% Web",
    desc: "Accede desde cualquier dispositivo con internet. Sin instalaciones, con tus datos seguros y respaldados.",
    icono: "☁️"
  }
];

const PLANES = [
  {
    nombre: "Básico",
    precio: "$990",
    detalle: "hasta 10 vehículos",
    incluye: ["Control de flota", "Mantenimiento", "Facturación + CFDI", "3 usuarios"]
  },
  {
    nombre: "Profesional",
    precio: "$2,490",
    detalle: "hasta 40 vehículos",
    incluye: ["Todo lo de Básico", "Módulo de RH completo", "10 usuarios", "Soporte prioritario"],
    destacado: true
  },
  {
    nombre: "Empresarial",
    precio: "Cotización",
    detalle: "flotillas grandes",
    incluye: ["Todo lo de Profesional", "Usuarios ilimitados", "Integraciones a medida", "Cuenta dedicada"]
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-brand-700">TMS<span className="text-slate-900">LATAM</span></span>
          <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#modulos" className="hover:text-brand-700">Módulos</a>
            <a href="#planes" className="hover:text-brand-700">Planes</a>
            <a href="#contacto" className="hover:text-brand-700">Contacto</a>
          </nav>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary">Iniciar sesión</Link>
            <Link href="/registro" className="btn-primary">Prueba gratis</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
          Software de gestión de transporte para LATAM
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Controla tu flota, mantenimiento, facturación y RH desde una sola plataforma web
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Un TMS pensado para empresas transportistas en México y LATAM: flota, mantenimiento,
          facturación con timbrado CFDI y recursos humanos, con suscripción mensual sin contratos forzosos.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/registro" className="btn-primary px-6 py-3 text-base">Comenzar prueba de 14 días</Link>
          <a href="#modulos" className="btn-secondary px-6 py-3 text-base">Ver módulos</a>
        </div>
      </section>

      <section id="modulos" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">Todo lo que tu operación necesita</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            Módulos integrados entre sí: lo que pasa en flota se refleja en mantenimiento y facturación.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MODULOS.map((m) => (
              <div key={m.titulo} className="card">
                <div className="mb-3 text-3xl">{m.icono}</div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{m.titulo}</h3>
                <p className="text-sm text-slate-600">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">Suscripción mensual, sin contratos forzosos</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            Cancela cuando quieras. Cambia de plan conforme crece tu flotilla.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {PLANES.map((p) => (
              <div
                key={p.nombre}
                className={`card flex flex-col ${p.destacado ? "border-brand-500 ring-2 ring-brand-100" : ""}`}
              >
                {p.destacado && (
                  <span className="mb-2 inline-block w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    Más popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900">{p.nombre}</h3>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {p.precio}
                  {p.precio.startsWith("$") && <span className="text-base font-normal text-slate-500">/mes</span>}
                </p>
                <p className="text-sm text-slate-500">{p.detalle}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
                  {p.incluye.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-brand-600">✓</span> {i}
                    </li>
                  ))}
                </ul>
                <Link href="/registro" className="btn-primary mt-6 w-full">Elegir plan</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-brand-700 py-16 text-center text-white">
        <h2 className="text-2xl font-bold">¿Listo para digitalizar tu operación de transporte?</h2>
        <p className="mt-2 text-brand-100">Crea tu cuenta y prueba todos los módulos gratis durante 14 días.</p>
        <Link href="/registro" className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 font-medium text-brand-700 hover:bg-brand-50">
          Crear cuenta gratis
        </Link>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} TMS LATAM. Todos los derechos reservados.
      </footer>
    </main>
  );
}

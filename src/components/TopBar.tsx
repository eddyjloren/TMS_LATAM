import { SesionTms } from "@/lib/session";
import { CerrarSesionBoton } from "@/components/CerrarSesionBoton";

export function TopBar({ sesion, titulo }: { sesion: SesionTms; titulo: string }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-slate-900">{titulo}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{sesion.name}</p>
          <p className="text-xs text-slate-500">{sesion.empresaNombre}</p>
        </div>
        <CerrarSesionBoton />
      </div>
    </header>
  );
}

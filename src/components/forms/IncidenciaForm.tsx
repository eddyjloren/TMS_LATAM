"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearIncidencia } from "@/actions/rh";

export function IncidenciaForm({ empleados }: { empleados: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const formData = new FormData(e.currentTarget);
    const res = await crearIncidencia(formData);
    setCargando(false);
    if (!res?.ok) {
      setError(res?.error || "No se pudo guardar.");
      return;
    }
    router.refresh();
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-4">
      <h3 className="text-base font-semibold text-slate-900">Registrar incidencia</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-field">Empleado</label>
          <select name="empleadoId" required className="input-field">
            <option value="">Selecciona...</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Tipo</label>
          <select name="tipo" required className="input-field" defaultValue="VACACIONES">
            <option value="FALTA">Falta</option>
            <option value="VACACIONES">Vacaciones</option>
            <option value="PERMISO">Permiso</option>
            <option value="INCAPACIDAD">Incapacidad</option>
            <option value="RETARDO">Retardo</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-field">Fecha inicio</label>
          <input name="fechaInicio" type="date" required className="input-field" />
        </div>
        <div>
          <label className="label-field">Fecha fin</label>
          <input name="fechaFin" type="date" required className="input-field" />
        </div>
      </div>

      <div>
        <label className="label-field">Motivo (opcional)</label>
        <input name="motivo" className="input-field" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={cargando} className="btn-primary">
        {cargando ? "Guardando..." : "Registrar"}
      </button>
    </form>
  );
}

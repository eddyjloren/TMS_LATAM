"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearMantenimiento } from "@/actions/mantenimientos";

export function MantenimientoForm({
  vehiculos
}: {
  vehiculos: { id: string; numeroEconomico: string }[];
  vehiculoIdFijo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const formData = new FormData(e.currentTarget);
    const res = await crearMantenimiento(formData);
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
      <h3 className="text-base font-semibold text-slate-900">Programar mantenimiento</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-field">Vehículo</label>
          <select name="vehiculoId" required className="input-field">
            <option value="">Selecciona...</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.numeroEconomico}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Tipo</label>
          <select name="tipo" required className="input-field" defaultValue="PREVENTIVO">
            <option value="PREVENTIVO">Preventivo</option>
            <option value="CORRECTIVO">Correctivo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label-field">Descripción</label>
        <input name="descripcion" required className="input-field" placeholder="Cambio de aceite y filtros" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label-field">Km objetivo</label>
          <input name="kmProgramado" type="number" step="0.01" className="input-field" />
        </div>
        <div>
          <label className="label-field">Fecha programada</label>
          <input name="fechaProgramada" type="date" className="input-field" />
        </div>
        <div>
          <label className="label-field">Costo estimado</label>
          <input name="costo" type="number" step="0.01" className="input-field" />
        </div>
      </div>

      <div>
        <label className="label-field">Taller</label>
        <input name="taller" className="input-field" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={cargando} className="btn-primary">
        {cargando ? "Guardando..." : "Programar"}
      </button>
    </form>
  );
}

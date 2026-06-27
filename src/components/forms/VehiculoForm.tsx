"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearVehiculo } from "@/actions/vehiculos";

export function VehiculoForm({ choferes }: { choferes: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const formData = new FormData(e.currentTarget);
    const res = await crearVehiculo(formData);
    setCargando(false);
    if (!res?.ok) {
      setError(res?.error || "No se pudo guardar.");
      return;
    }
    router.push("/dashboard/flota");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-field">Número económico</label>
          <input name="numeroEconomico" required className="input-field" placeholder="T-101" />
        </div>
        <div>
          <label className="label-field">Placas</label>
          <input name="placas" required className="input-field" placeholder="ABC-123-A" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label-field">Marca</label>
          <input name="marca" required className="input-field" placeholder="Kenworth" />
        </div>
        <div>
          <label className="label-field">Modelo</label>
          <input name="modelo" required className="input-field" placeholder="T680" />
        </div>
        <div>
          <label className="label-field">Año</label>
          <input name="anio" type="number" required className="input-field" placeholder="2022" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-field">Tipo de unidad</label>
          <select name="tipo" required className="input-field">
            <option value="Tractocamión">Tractocamión</option>
            <option value="Caja seca">Caja seca</option>
            <option value="Torton">Torton</option>
            <option value="Rabón">Rabón</option>
            <option value="Pickup">Pickup</option>
          </select>
        </div>
        <div>
          <label className="label-field">Odómetro actual (km)</label>
          <input name="odometroKm" type="number" step="0.01" className="input-field" placeholder="0" />
        </div>
      </div>

      <div>
        <label className="label-field">Chofer asignado (opcional)</label>
        <select name="choferAsignadoId" className="input-field">
          <option value="">Sin asignar</option>
          {choferes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-field">Vigencia de seguro</label>
          <input name="vigenciaSeguro" type="date" className="input-field" />
        </div>
        <div>
          <label className="label-field">Vigencia de permiso</label>
          <input name="vigenciaPermiso" type="date" className="input-field" />
        </div>
      </div>

      <div>
        <label className="label-field">Notas</label>
        <textarea name="notas" className="input-field" rows={2} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={cargando} className="btn-primary">
        {cargando ? "Guardando..." : "Guardar vehículo"}
      </button>
    </form>
  );
}

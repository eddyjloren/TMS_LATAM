"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearChofer } from "@/actions/vehiculos";

export function ChoferForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const formData = new FormData(e.currentTarget);
    const res = await crearChofer(formData);
    setCargando(false);
    if (!res?.ok) {
      setError(res?.error || "No se pudo guardar.");
      return;
    }
    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} className="btn-secondary">
        + Nuevo chofer
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-md space-y-3">
      <div>
        <label className="label-field">Nombre completo</label>
        <input name="nombre" required className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Licencia</label>
          <input name="licencia" required className="input-field" />
        </div>
        <div>
          <label className="label-field">Tipo</label>
          <input name="tipoLicencia" className="input-field" placeholder="Federal" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Vigencia licencia</label>
          <input name="vigenciaLicencia" type="date" className="input-field" />
        </div>
        <div>
          <label className="label-field">Teléfono</label>
          <input name="telefono" className="input-field" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={cargando} className="btn-primary">
          {cargando ? "Guardando..." : "Guardar chofer"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}

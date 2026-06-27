"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearEmpleado } from "@/actions/rh";

export function EmpleadoForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const formData = new FormData(e.currentTarget);
    const res = await crearEmpleado(formData);
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
      <button onClick={() => setAbierto(true)} className="btn-primary">
        + Nuevo empleado
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-xl space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Nombre completo</label>
          <input name="nombre" required className="input-field" />
        </div>
        <div>
          <label className="label-field">Puesto</label>
          <input name="puesto" required className="input-field" placeholder="Chofer, Despachador, Contador..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Departamento</label>
          <input name="departamento" className="input-field" defaultValue="Operaciones" />
        </div>
        <div>
          <label className="label-field">Fecha de ingreso</label>
          <input name="fechaIngreso" type="date" required className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Salario mensual</label>
          <input name="salarioMensual" type="number" step="0.01" className="input-field" />
        </div>
        <div>
          <label className="label-field">Teléfono</label>
          <input name="telefono" className="input-field" />
        </div>
      </div>
      <div>
        <label className="label-field">Email</label>
        <input name="email" type="email" className="input-field" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={cargando} className="btn-primary">
          {cargando ? "Guardando..." : "Guardar empleado"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}

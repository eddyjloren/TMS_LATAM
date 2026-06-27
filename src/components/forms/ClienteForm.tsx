"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearCliente } from "@/actions/clientes";

export function ClienteForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const formData = new FormData(e.currentTarget);
    const res = await crearCliente(formData);
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
        + Nuevo cliente
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-xl space-y-3">
      <div>
        <label className="label-field">Razón social</label>
        <input name="razonSocial" required className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">RFC</label>
          <input name="rfc" required className="input-field" placeholder="XAXX010101000" />
        </div>
        <div>
          <label className="label-field">Código postal fiscal</label>
          <input name="codigoPostal" required className="input-field" placeholder="06000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Uso de CFDI</label>
          <select name="usoCfdi" className="input-field" defaultValue="G03">
            <option value="G03">G03 - Gastos en general</option>
            <option value="P01">P01 - Por definir</option>
            <option value="I08">I08 - Otra maquinaria y equipo</option>
          </select>
        </div>
        <div>
          <label className="label-field">Régimen fiscal receptor</label>
          <input name="regimenFiscalReceptor" className="input-field" defaultValue="616" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Email</label>
          <input name="email" type="email" className="input-field" />
        </div>
        <div>
          <label className="label-field">Teléfono</label>
          <input name="telefono" className="input-field" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={cargando} className="btn-primary">
          {cargando ? "Guardando..." : "Guardar cliente"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}

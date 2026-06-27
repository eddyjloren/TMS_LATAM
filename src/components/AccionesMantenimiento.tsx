"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { completarMantenimiento, cancelarMantenimiento } from "@/actions/mantenimientos";

export function AccionesMantenimiento({ id, odometroActual }: { id: string; odometroActual: number }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function completar() {
    const km = window.prompt("Km al realizar el mantenimiento:", String(odometroActual));
    if (km === null) return;
    setCargando(true);
    await completarMantenimiento(id, parseFloat(km));
    setCargando(false);
    router.refresh();
  }

  async function cancelar() {
    setCargando(true);
    await cancelarMantenimiento(id);
    setCargando(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button disabled={cargando} onClick={completar} className="text-xs font-medium text-green-600 hover:underline">
        Completar
      </button>
      <button disabled={cargando} onClick={cancelar} className="text-xs font-medium text-slate-500 hover:underline">
        Cancelar
      </button>
    </div>
  );
}

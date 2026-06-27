"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { darBajaEmpleado } from "@/actions/rh";

export function BotonBajaEmpleado({ id }: { id: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function onClick() {
    if (!window.confirm("¿Confirmas dar de baja a este empleado?")) return;
    setCargando(true);
    await darBajaEmpleado(id);
    setCargando(false);
    router.refresh();
  }

  return (
    <button disabled={cargando} onClick={onClick} className="text-xs font-medium text-red-500 hover:underline">
      Dar de baja
    </button>
  );
}

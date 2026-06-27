"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cambiarPlan, registrarPagoManual } from "@/actions/suscripcion";

export function BotonCambiarPlan({ planId, esActual }: { planId: string; esActual: boolean }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function onClick() {
    setCargando(true);
    await cambiarPlan(planId);
    setCargando(false);
    router.refresh();
  }

  if (esActual) {
    return <span className="btn-secondary cursor-default opacity-70">Plan actual</span>;
  }

  return (
    <button disabled={cargando} onClick={onClick} className="btn-primary w-full">
      {cargando ? "Cambiando..." : "Cambiar a este plan"}
    </button>
  );
}

export function BotonRegistrarPago({ montoSugerido }: { montoSugerido: number }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function onClick() {
    const montoStr = window.prompt("Monto pagado (MXN):", montoSugerido.toFixed(2));
    if (!montoStr) return;
    setCargando(true);
    await registrarPagoManual(parseFloat(montoStr));
    setCargando(false);
    router.refresh();
  }

  return (
    <button disabled={cargando} onClick={onClick} className="btn-primary">
      {cargando ? "Registrando..." : "Registrar pago recibido"}
    </button>
  );
}

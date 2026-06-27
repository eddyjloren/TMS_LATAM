"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { timbrarFactura, cancelarFactura } from "@/actions/facturas";

export function AccionesFactura({ id, estatus }: { id: string; estatus: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function timbrar() {
    setCargando(true);
    setError(null);
    const res = await timbrarFactura(id);
    setCargando(false);
    if (!res.ok) {
      setError(res.error || "Error al timbrar.");
      return;
    }
    router.refresh();
  }

  async function cancelar() {
    const motivo = window.prompt("Motivo de cancelación:", "02 - Comprobantes emitidos con errores");
    if (!motivo) return;
    setCargando(true);
    await cancelarFactura(id, motivo);
    setCargando(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        {estatus === "BORRADOR" || estatus === "ERROR_TIMBRADO" ? (
          <button disabled={cargando} onClick={timbrar} className="btn-primary">
            {cargando ? "Timbrando..." : "Timbrar factura (CFDI)"}
          </button>
        ) : null}
        {estatus === "TIMBRADA" && (
          <button disabled={cargando} onClick={cancelar} className="btn-secondary">
            Cancelar factura
          </button>
        )}
      </div>
    </div>
  );
}

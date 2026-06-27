"use client";

import { useState } from "react";
import { crearFacturaBorrador } from "@/actions/facturas";

type Item = { descripcion: string; vehiculoId: string; cantidad: number; precioUnitario: number };

export function FacturaForm({
  clientes,
  vehiculos
}: {
  clientes: { id: string; razonSocial: string; rfc: string }[];
  vehiculos: { id: string; numeroEconomico: string }[];
}) {
  const [items, setItems] = useState<Item[]>([
    { descripcion: "Servicio de transporte de carga", vehiculoId: "", cantidad: 1, precioUnitario: 0 }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function actualizarItem(idx: number, campo: keyof Item, valor: string | number) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)));
  }

  function agregarItem() {
    setItems((prev) => [...prev, { descripcion: "", vehiculoId: "", cantidad: 1, precioUnitario: 0 }]);
  }

  function quitarItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    const clienteId = formData.get("clienteId") as string;
    const formaPago = formData.get("formaPago") as string;
    const metodoPago = formData.get("metodoPago") as "PUE" | "PPD";

    const res = await crearFacturaBorrador({
      clienteId,
      formaPago,
      metodoPago,
      items: items.map((i) => ({
        descripcion: i.descripcion,
        vehiculoId: i.vehiculoId || undefined,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario
      }))
    });

    setCargando(false);
    if (res && !res.ok) {
      setError(res.error || "No se pudo crear la factura.");
    }
    // si tiene éxito, crearFacturaBorrador hace redirect() del lado del servidor
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-3xl space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <label className="label-field">Cliente</label>
          <select name="clienteId" required className="input-field">
            <option value="">Selecciona...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razonSocial} ({c.rfc})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Forma de pago (SAT)</label>
          <input name="formaPago" defaultValue="99" className="input-field" placeholder="03 = Transferencia" />
        </div>
        <div>
          <label className="label-field">Método de pago</label>
          <select name="metodoPago" className="input-field" defaultValue="PUE">
            <option value="PUE">PUE - Pago en una exhibición</option>
            <option value="PPD">PPD - Pago en parcialidades</option>
          </select>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label-field !mb-0">Conceptos</label>
          <button type="button" onClick={agregarItem} className="text-sm font-medium text-brand-600 hover:underline">
            + Agregar concepto
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 rounded-lg border border-slate-200 p-3">
              <input
                className="input-field col-span-4"
                placeholder="Descripción del servicio"
                value={item.descripcion}
                onChange={(e) => actualizarItem(idx, "descripcion", e.target.value)}
                required
              />
              <select
                className="input-field col-span-3"
                value={item.vehiculoId}
                onChange={(e) => actualizarItem(idx, "vehiculoId", e.target.value)}
              >
                <option value="">Sin unidad</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.numeroEconomico}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0.01}
                step="0.01"
                className="input-field col-span-2"
                placeholder="Cant."
                value={item.cantidad}
                onChange={(e) => actualizarItem(idx, "cantidad", parseFloat(e.target.value) || 0)}
              />
              <input
                type="number"
                min={0}
                step="0.01"
                className="input-field col-span-2"
                placeholder="Precio unit."
                value={item.precioUnitario}
                onChange={(e) => actualizarItem(idx, "precioUnitario", parseFloat(e.target.value) || 0)}
              />
              <button
                type="button"
                onClick={() => quitarItem(idx)}
                className="col-span-1 text-xs font-medium text-red-500 hover:underline"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-auto w-64 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span>{subtotal.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">IVA (16%)</span>
          <span>{iva.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{total.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={cargando} className="btn-primary">
        {cargando ? "Guardando..." : "Guardar factura (borrador)"}
      </button>
    </form>
  );
}

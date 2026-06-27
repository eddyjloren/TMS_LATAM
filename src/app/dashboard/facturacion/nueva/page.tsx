import Link from "next/link";
import { listarClientes } from "@/actions/clientes";
import { listarVehiculos } from "@/actions/vehiculos";
import { FacturaForm } from "@/components/forms/FacturaForm";

export default async function NuevaFacturaPage() {
  const [clientes, vehiculos] = await Promise.all([listarClientes(), listarVehiculos()]);

  if (clientes.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Nueva factura</h2>
        <p className="text-sm text-slate-600">
          Necesitas registrar al menos un cliente antes de facturar.{" "}
          <Link href="/dashboard/facturacion/clientes" className="font-medium text-brand-600 hover:underline">
            Agregar cliente
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Nueva factura</h2>
      <FacturaForm
        clientes={clientes.map((c) => ({ id: c.id, razonSocial: c.razonSocial, rfc: c.rfc }))}
        vehiculos={vehiculos.map((v) => ({ id: v.id, numeroEconomico: v.numeroEconomico }))}
      />
    </div>
  );
}

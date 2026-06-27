import { listarChoferes } from "@/actions/vehiculos";
import { VehiculoForm } from "@/components/forms/VehiculoForm";

export default async function NuevoVehiculoPage() {
  const choferes = await listarChoferes();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Nuevo vehículo</h2>
      <VehiculoForm choferes={choferes} />
    </div>
  );
}

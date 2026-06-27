import { listarClientes } from "@/actions/clientes";
import { ClienteForm } from "@/components/forms/ClienteForm";

export default async function ClientesPage() {
  const clientes = await listarClientes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Clientes de facturación</h2>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Razón social</th>
              <th className="px-4 py-3">RFC</th>
              <th className="px-4 py-3">Uso CFDI</th>
              <th className="px-4 py-3">CP</th>
              <th className="px-4 py-3">Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{c.razonSocial}</td>
                <td className="px-4 py-3">{c.rfc}</td>
                <td className="px-4 py-3">{c.usoCfdi}</td>
                <td className="px-4 py-3">{c.codigoPostal}</td>
                <td className="px-4 py-3">{c.email || c.telefono || "—"}</td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Sin clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ClienteForm />
    </div>
  );
}

import { requireSesion } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sesion = await requireSesion();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar sesion={sesion} />
      <div className="flex flex-1 flex-col">
        <TopBar sesion={sesion} titulo="Panel" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

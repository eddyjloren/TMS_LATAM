import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export type SesionTms = {
  id: string;
  name: string;
  email: string;
  rol: "SUPER_ADMIN" | "ADMIN" | "OPERADOR_FLOTA" | "FACTURACION" | "RH" | "SOLO_LECTURA";
  empresaId: string;
  empresaNombre: string;
};

/** Obtiene la sesión actual o redirige a /login si no hay usuario autenticado. */
export async function requireSesion(): Promise<SesionTms> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return session!.user as unknown as SesionTms;
}

/** Lanza si el rol del usuario no está en la lista de roles permitidos. */
export function requireRol(sesion: SesionTms, rolesPermitidos: SesionTms["rol"][]) {
  if (!rolesPermitidos.includes(sesion.rol)) {
    throw new Error("No tienes permisos para realizar esta acción.");
  }
}

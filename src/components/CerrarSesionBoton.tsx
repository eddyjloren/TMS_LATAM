"use client";

import { signOut } from "next-auth/react";

export function CerrarSesionBoton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary text-xs">
      Cerrar sesión
    </button>
  );
}

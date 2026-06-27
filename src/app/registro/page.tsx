"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registrarEmpresa } from "@/actions/auth";
import { signIn } from "next-auth/react";

export default function RegistroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    const resultado = await registrarEmpresa(formData);

    if (!resultado.ok) {
      setError(resultado.error || "No se pudo crear la cuenta.");
      setCargando(false);
      return;
    }

    const loginRes = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });

    setCargando(false);

    if (loginRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="card w-full max-w-md">
        <Link href="/" className="text-xl font-bold text-brand-700">
          TMS<span className="text-slate-900">LATAM</span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">14 días de prueba gratis, sin tarjeta requerida.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label-field">Nombre de tu empresa</label>
            <input name="empresaNombre" required className="input-field" placeholder="Transportes Ejemplo S.A. de C.V." />
          </div>
          <div>
            <label className="label-field">Tu nombre</label>
            <input name="nombre" required className="input-field" placeholder="Juan Pérez" />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input name="email" type="email" required className="input-field" placeholder="tucorreo@empresa.com" />
          </div>
          <div>
            <label className="label-field">Contraseña</label>
            <input name="password" type="password" required minLength={8} className="input-field" placeholder="Mínimo 8 caracteres" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={cargando} className="btn-primary w-full">
            {cargando ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

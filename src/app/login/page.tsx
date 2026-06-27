"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });

    setCargando(false);

    if (res?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-md">
        <Link href="/" className="text-xl font-bold text-brand-700">
          TMS<span className="text-slate-900">LATAM</span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-500">Accede al panel de tu empresa.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label-field">Email</label>
            <input name="email" type="email" required className="input-field" placeholder="tucorreo@empresa.com" />
          </div>
          <div>
            <label className="label-field">Contraseña</label>
            <input name="password" type="password" required className="input-field" placeholder="••••••••" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={cargando} className="btn-primary w-full">
            {cargando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-brand-600 hover:underline">
            Crea una gratis
          </Link>
        </p>
      </div>
    </main>
  );
}

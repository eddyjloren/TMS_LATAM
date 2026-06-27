import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TMS LATAM | Sistema de Gestión de Transporte",
  description:
    "TMS en la nube: control de flota, mantenimiento, facturación con timbrado CFDI y RH en una sola plataforma. Suscripción mensual."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

# TMS LATAM — Sistema de Gestión de Transporte (MVP)

Web app (Next.js + PostgreSQL) tipo Transoft / Kordata, con:

- **Control de Flota**: vehículos, choferes, documentos (seguro/permiso) con alertas de vencimiento.
- **Mantenimiento integrado**: preventivo (por km o fecha) y correctivo, historial por unidad, alertas en el dashboard.
- **Facturación + Timbrado CFDI**: clientes, facturas, generación de XML CFDI 4.0 y timbrado vía adaptador PAC plugable.
- **Módulo de RH**: empleados, asistencia/incidencias, vínculo con choferes de flota.
- **Suscripción mensual (SaaS)**: planes, periodo de prueba, historial de pagos.
- Multi-tenant: cada empresa transportista que se registra es un tenant aislado.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth (credenciales) · xmlbuilder2.

## ⚠️ Importante: límites legales del timbrado CFDI y los cobros

No es posible que **todo** el sistema sea 100% open source en dos puntos, porque son servicios regulados:

1. **Timbrado fiscal (CFDI)**: la ley exige que el folio fiscal (UUID) lo asigne un **PAC autorizado por el SAT**.
   No existe un "PAC open source". Este proyecto sí construye el XML del CFDI 4.0 con una librería open
   source (`xmlbuilder2`), pero el timbrado en sí corre en **modo MOCK** por defecto (gratis, ideal para
   desarrollo y demos). Cuando quieras timbrar facturas reales, contrata un PAC (ej. Facturama, SW Sapien,
   Finkok) y crea un adaptador nuevo en `src/lib/pac.ts` (ya hay un ejemplo comentado de cómo se vería).
2. **Cobro recurrente de la suscripción**: cobrar con tarjeta requiere un procesador de pagos regulado
   (Stripe, Conekta, etc.). Por defecto el sistema usa `BILLING_PROVIDER=manual`: el administrador registra
   los pagos a mano (transferencia/depósito) y el sistema solo controla la vigencia. Ver `src/lib/billing.ts`.

El resto del sistema (flota, mantenimiento, RH, generación del CFDI, la app web completa) es 100% código
propio, sin dependencias propietarias.

## Estructura del proyecto

```
prisma/
  schema.prisma       Modelo de datos completo (empresa, flota, mantenimiento, facturación, RH, suscripción)
  seed.ts             Datos demo (empresa, usuario, vehículos, factura de ejemplo, etc.)
src/
  app/
    page.tsx          Landing pública (marketing)
    login/, registro/ Páginas de autenticación
    dashboard/        App privada (requiere sesión)
      flota/
      mantenimiento/
      facturacion/
      rh/
      suscripcion/
    api/auth/         Endpoint de NextAuth
  actions/            Server Actions (toda la lógica de negocio, separada por módulo)
  components/         UI reutilizable y formularios
  lib/
    prisma.ts         Cliente de Prisma
    auth.ts            Configuración de NextAuth
    session.ts         Helper para obtener/proteger la sesión
    cfdi.ts             Construcción del XML CFDI 4.0
    pac.ts              Adaptador PAC (mock por defecto, plugable a futuro)
    billing.ts          Adaptador de cobro recurrente (manual por defecto)
    validations.ts      Esquemas de validación (zod)
```

## Cómo correrlo localmente

Este proyecto se generó en un entorno sin acceso a internet, así que **no se instalaron `node_modules` ni se
corrió `npm install`/`npm run build` todavía**. Para levantarlo en tu máquina:

```bash
# 1. Instala dependencias
npm install

# 2. Levanta una base de datos PostgreSQL (o usa una que ya tengas)
docker compose up -d

# 3. Copia las variables de entorno
cp .env.example .env
# Edita DATABASE_URL si no usas el docker-compose incluido, y genera un NEXTAUTH_SECRET
# (puedes generar uno con: openssl rand -base64 32)

# 4. Crea las tablas en la base de datos
npx prisma migrate dev --name init

# 5. Carga datos de demostración
npm run prisma:seed

# 6. Corre la app
npm run dev
```

Abre http://localhost:3000. Para entrar con los datos demo:

- Email: `demo@tms.mx`
- Password: `Demo1234!`

O crea tu propia empresa desde `/registro` (incluye 14 días de prueba automáticos).

## Flujos clave a probar

1. **Flota**: `/dashboard/flota` → crear vehículo y chofer → ver detalle de la unidad.
2. **Mantenimiento**: desde el detalle de un vehículo o `/dashboard/mantenimiento`, programar mantenimiento;
   si el km objetivo o la fecha están próximos, aparece como alerta en el dashboard.
3. **Facturación**: `/dashboard/facturacion/clientes` → crear cliente → `/dashboard/facturacion/nueva` →
   capturar conceptos → guardar como borrador → entrar al detalle de la factura y dar clic en
   "Timbrar factura (CFDI)" (modo mock: genera UUID y XML al instante, sin costo).
4. **RH**: `/dashboard/rh` → alta de empleado → `/dashboard/rh/asistencia` → registrar incidencia.
5. **Suscripción**: `/dashboard/suscripcion` → cambiar de plan, registrar pago manual.

## Roles de usuario

`ADMIN`, `OPERADOR_FLOTA`, `FACTURACION`, `RH`, `SOLO_LECTURA` (definidos en el esquema; el MVP da de alta
usuarios como `ADMIN` al registrar la empresa — la gestión de usuarios adicionales por rol es un siguiente
paso natural).

## Siguientes pasos sugeridos

- Pantalla de administración de usuarios por empresa (alta de roles OPERADOR_FLOTA, FACTURACION, RH).
- Conectar un PAC real para timbrado en producción (`src/lib/pac.ts`) y cargar el CSD del emisor.
- Conectar Stripe (o Conekta/Openpay) para cobro automático de la suscripción (`src/lib/billing.ts`).
- Exportar PDF de la factura timbrada (representación impresa del CFDI).
- Reportes: costos de mantenimiento por unidad, nómina, cobranza por cliente.
- Notificaciones por email/WhatsApp para vencimientos de seguro, permisos y mantenimientos.

/**
 * Crea (o actualiza) el usuario SUPER_ADMIN de la plataforma, junto con una
 * empresa interna "Plataforma" que lo alberga (Usuario.empresaId es
 * obligatorio en el esquema, así que el super admin necesita una empresa
 * "casa" aunque no opera flota real). Es idempotente: se puede correr varias
 * veces sin duplicar nada.
 *
 * Uso:
 *   SUPERADMIN_EMAIL=tu@correo.com SUPERADMIN_PASSWORD=TuClaveSegura npm run crear-super-admin
 *
 * Si no se definen las variables de entorno, usa valores por defecto
 * (cámbialos después de tu primer login).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMPRESA_PLATAFORMA_ID = "plataforma-interna";
const EMAIL = process.env.SUPERADMIN_EMAIL ?? "superadmin@tms.mx";
const PASSWORD = process.env.SUPERADMIN_PASSWORD ?? "SuperAdmin1234!";

async function main() {
  const empresaPlataforma = await prisma.empresa.upsert({
    where: { id: EMPRESA_PLATAFORMA_ID },
    update: {},
    create: {
      id: EMPRESA_PLATAFORMA_ID,
      nombre: "Plataforma TMS LATAM",
      emailContacto: "plataforma@tms.mx",
      activa: true
    }
  });

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  await prisma.usuario.upsert({
    where: { email: EMAIL },
    update: { passwordHash, rol: "SUPER_ADMIN", activo: true },
    create: {
      empresaId: empresaPlataforma.id,
      nombre: "Super Admin",
      email: EMAIL,
      passwordHash,
      rol: "SUPER_ADMIN"
    }
  });

  console.log("Listo. Super admin:", EMAIL, "/", PASSWORD);
  console.log("Inicia sesión en /login y entra a /dashboard/admin-plataforma");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

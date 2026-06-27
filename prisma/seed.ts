import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Sembrando datos demo...");

  // --- Planes ---
  const [basico, profesional, empresarial] = await Promise.all([
    prisma.plan.upsert({
      where: { codigo: "BASICO" },
      update: {},
      create: {
        codigo: "BASICO",
        nombre: "Básico",
        precioMensual: 990,
        limiteVehiculos: 10,
        limiteUsuarios: 3,
        limiteFacturasMes: 50,
        descripcion: "Ideal para flotillas pequeñas que están comenzando."
      }
    }),
    prisma.plan.upsert({
      where: { codigo: "PROFESIONAL" },
      update: {},
      create: {
        codigo: "PROFESIONAL",
        nombre: "Profesional",
        precioMensual: 2490,
        limiteVehiculos: 40,
        limiteUsuarios: 10,
        limiteFacturasMes: 300,
        descripcion: "Para empresas en crecimiento con RH completo."
      }
    }),
    prisma.plan.upsert({
      where: { codigo: "EMPRESARIAL" },
      update: {},
      create: {
        codigo: "EMPRESARIAL",
        nombre: "Empresarial",
        precioMensual: 5990,
        limiteVehiculos: 9999,
        limiteUsuarios: 9999,
        limiteFacturasMes: 9999,
        descripcion: "Flotillas grandes, usuarios e integraciones ilimitadas."
      }
    })
  ]);

  // --- Empresa demo ---
  const passwordHash = await bcrypt.hash("Demo1234!", 10);

  const empresa = await prisma.empresa.upsert({
    where: { id: "empresa-demo" },
    update: {},
    create: {
      id: "empresa-demo",
      nombre: "Transportes Demo S.A. de C.V.",
      rfc: "TDE990101AAA",
      regimenFiscal: "601",
      codigoPostal: "64000",
      direccion: "Av. Siempre Viva 123, Monterrey, NL",
      telefono: "8181818181",
      emailContacto: "contacto@transportesdemo.mx",
      usuarios: {
        create: {
          nombre: "Admin Demo",
          email: "demo@tms.mx",
          passwordHash,
          rol: "ADMIN"
        }
      },
      suscripcion: {
        create: {
          planId: profesional.id,
          estatus: "ACTIVA",
          fechaProximoCobro: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
      },
      seriesFiscales: {
        create: { serie: "A", ultimoFolio: 0 }
      }
    }
  });

  // --- Choferes ---
  const chofer1 = await prisma.chofer.create({
    data: {
      empresaId: empresa.id,
      nombre: "Carlos Martínez",
      licencia: "LIC-001-2024",
      tipoLicencia: "Federal",
      vigenciaLicencia: new Date("2027-01-15"),
      telefono: "8112233445"
    }
  });

  const chofer2 = await prisma.chofer.create({
    data: {
      empresaId: empresa.id,
      nombre: "Ricardo Salas",
      licencia: "LIC-002-2024",
      tipoLicencia: "Federal",
      vigenciaLicencia: new Date("2026-08-01"),
      telefono: "8119988776"
    }
  });

  // --- Vehículos ---
  const vehiculo1 = await prisma.vehiculo.create({
    data: {
      empresaId: empresa.id,
      numeroEconomico: "T-101",
      placas: "ABC-123-A",
      marca: "Kenworth",
      modelo: "T680",
      anio: 2022,
      tipo: "Tractocamión",
      capacidadCarga: 30,
      odometroKm: 84500,
      estatus: "EN_RUTA",
      polizaSeguro: "POL-55421",
      vigenciaSeguro: new Date("2026-12-01"),
      vigenciaPermiso: new Date("2026-09-01"),
      choferAsignadoId: chofer1.id
    }
  });

  const vehiculo2 = await prisma.vehiculo.create({
    data: {
      empresaId: empresa.id,
      numeroEconomico: "T-102",
      placas: "XYZ-987-B",
      marca: "Freightliner",
      modelo: "Cascadia",
      anio: 2021,
      tipo: "Tractocamión",
      capacidadCarga: 28,
      odometroKm: 152300,
      estatus: "DISPONIBLE",
      polizaSeguro: "POL-55422",
      vigenciaSeguro: new Date("2026-07-10"),
      vigenciaPermiso: new Date("2026-07-20"),
      choferAsignadoId: chofer2.id
    }
  });

  // --- Mantenimientos ---
  await prisma.mantenimiento.create({
    data: {
      empresaId: empresa.id,
      vehiculoId: vehiculo1.id,
      tipo: "PREVENTIVO",
      descripcion: "Cambio de aceite y filtros",
      estatus: "PROGRAMADO",
      kmProgramado: 85000,
      fechaProgramada: new Date(new Date().setDate(new Date().getDate() + 5)),
      taller: "Taller Central"
    }
  });

  await prisma.mantenimiento.create({
    data: {
      empresaId: empresa.id,
      vehiculoId: vehiculo2.id,
      tipo: "CORRECTIVO",
      descripcion: "Revisión de frenos",
      estatus: "COMPLETADO",
      fechaRealizado: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      kmAlRealizar: 150000,
      costo: 4500,
      taller: "Frenos y Suspensiones del Norte"
    }
  });

  // --- Cliente de facturación ---
  const cliente = await prisma.clienteFacturacion.create({
    data: {
      empresaId: empresa.id,
      razonSocial: "Distribuidora ABC S.A. de C.V.",
      rfc: "DABC850101XXX",
      usoCfdi: "G03",
      regimenFiscalReceptor: "601",
      codigoPostal: "64000",
      email: "pagos@distribuidoraabc.mx"
    }
  });

  await prisma.factura.create({
    data: {
      empresaId: empresa.id,
      clienteId: cliente.id,
      serie: "A",
      folio: 1,
      subtotal: 15000,
      iva: 2400,
      total: 17400,
      estatus: "BORRADOR",
      items: {
        create: [
          {
            vehiculoId: vehiculo1.id,
            descripcion: "Servicio de transporte de carga Monterrey - CDMX",
            cantidad: 1,
            precioUnitario: 15000,
            importe: 15000
          }
        ]
      }
    }
  });

  // --- Empleados / RH ---
  await prisma.empleado.create({
    data: {
      empresaId: empresa.id,
      nombre: "Laura Gómez",
      puesto: "Coordinadora de Tráfico",
      departamento: "Operaciones",
      fechaIngreso: new Date("2023-03-01"),
      salarioMensual: 18000,
      email: "laura.gomez@transportesdemo.mx"
    }
  });

  await prisma.empleado.create({
    data: {
      empresaId: empresa.id,
      nombre: "Mario Torres",
      puesto: "Contador",
      departamento: "Administración",
      fechaIngreso: new Date("2022-06-15"),
      salarioMensual: 22000,
      email: "mario.torres@transportesdemo.mx"
    }
  });

  console.log("Listo. Usuario demo: demo@tms.mx / Demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

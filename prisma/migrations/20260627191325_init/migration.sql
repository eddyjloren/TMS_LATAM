-- CreateEnum
CREATE TYPE "PlanCodigo" AS ENUM ('BASICO', 'PROFESIONAL', 'EMPRESARIAL');

-- CreateEnum
CREATE TYPE "EstatusSuscripcion" AS ENUM ('EN_PRUEBA', 'ACTIVA', 'PAGO_PENDIENTE', 'SUSPENDIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstatusPago" AS ENUM ('PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'OPERADOR_FLOTA', 'FACTURACION', 'RH', 'SOLO_LECTURA');

-- CreateEnum
CREATE TYPE "EstatusVehiculo" AS ENUM ('DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO');

-- CreateEnum
CREATE TYPE "EstatusChofer" AS ENUM ('ACTIVO', 'INACTIVO', 'DE_BAJA');

-- CreateEnum
CREATE TYPE "TipoMantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO');

-- CreateEnum
CREATE TYPE "EstatusMantenimiento" AS ENUM ('PROGRAMADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstatusFactura" AS ENUM ('BORRADOR', 'TIMBRADA', 'CANCELADA', 'ERROR_TIMBRADO');

-- CreateEnum
CREATE TYPE "EstatusEmpleado" AS ENUM ('ACTIVO', 'BAJA');

-- CreateEnum
CREATE TYPE "TipoIncidencia" AS ENUM ('FALTA', 'VACACIONES', 'PERMISO', 'INCAPACIDAD', 'RETARDO');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "codigo" "PlanCodigo" NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioMensual" DECIMAL(10,2) NOT NULL,
    "limiteVehiculos" INTEGER NOT NULL,
    "limiteUsuarios" INTEGER NOT NULL,
    "limiteFacturasMes" INTEGER NOT NULL,
    "incluyeRH" BOOLEAN NOT NULL DEFAULT true,
    "incluyeTimbrado" BOOLEAN NOT NULL DEFAULT true,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "estatus" "EstatusSuscripcion" NOT NULL DEFAULT 'EN_PRUEBA',
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFinPrueba" TIMESTAMP(3),
    "fechaProximoCobro" TIMESTAMP(3),
    "proveedorPago" TEXT NOT NULL DEFAULT 'manual',
    "referenciaPago" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "suscripcionId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFin" TIMESTAMP(3) NOT NULL,
    "estatus" "EstatusPago" NOT NULL DEFAULT 'PENDIENTE',
    "referenciaPago" TEXT,
    "pagadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rfc" TEXT,
    "regimenFiscal" TEXT,
    "codigoPostal" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "emailContacto" TEXT,
    "logoUrl" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'ADMIN',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "numeroEconomico" TEXT NOT NULL,
    "placas" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "capacidadCarga" DECIMAL(10,2),
    "odometroKm" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estatus" "EstatusVehiculo" NOT NULL DEFAULT 'DISPONIBLE',
    "polizaSeguro" TEXT,
    "vigenciaSeguro" TIMESTAMP(3),
    "vigenciaPermiso" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "choferAsignadoId" TEXT,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chofer" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "licencia" TEXT NOT NULL,
    "tipoLicencia" TEXT,
    "vigenciaLicencia" TIMESTAMP(3),
    "telefono" TEXT,
    "estatus" "EstatusChofer" NOT NULL DEFAULT 'ACTIVO',
    "empleadoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chofer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mantenimiento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "tipo" "TipoMantenimiento" NOT NULL DEFAULT 'PREVENTIVO',
    "descripcion" TEXT NOT NULL,
    "estatus" "EstatusMantenimiento" NOT NULL DEFAULT 'PROGRAMADO',
    "kmProgramado" DECIMAL(12,2),
    "fechaProgramada" TIMESTAMP(3),
    "fechaRealizado" TIMESTAMP(3),
    "kmAlRealizar" DECIMAL(12,2),
    "costo" DECIMAL(10,2),
    "taller" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteFacturacion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "usoCfdi" TEXT NOT NULL DEFAULT 'G03',
    "regimenFiscalReceptor" TEXT NOT NULL DEFAULT '616',
    "codigoPostal" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClienteFacturacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerieFiscal" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "serie" TEXT NOT NULL DEFAULT 'A',
    "ultimoFolio" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SerieFiscal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "serie" TEXT NOT NULL DEFAULT 'A',
    "folio" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "iva" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "formaPago" TEXT NOT NULL DEFAULT '99',
    "metodoPago" TEXT NOT NULL DEFAULT 'PUE',
    "estatus" "EstatusFactura" NOT NULL DEFAULT 'BORRADOR',
    "uuidFiscal" TEXT,
    "xmlCfdi" TEXT,
    "selloDigital" TEXT,
    "fechaTimbrado" TIMESTAMP(3),
    "pacUsado" TEXT,
    "motivoCancelacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacturaItem" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "vehiculoId" TEXT,
    "claveProdServ" TEXT NOT NULL DEFAULT '78101800',
    "claveUnidad" TEXT NOT NULL DEFAULT 'E48',
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "importe" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "FacturaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "departamento" TEXT NOT NULL DEFAULT 'Operaciones',
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaBaja" TIMESTAMP(3),
    "salarioMensual" DECIMAL(10,2),
    "email" TEXT,
    "telefono" TEXT,
    "estatus" "EstatusEmpleado" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incidencia" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "tipo" "TipoIncidencia" NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incidencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_codigo_key" ON "Plan"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Suscripcion_empresaId_key" ON "Suscripcion"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Vehiculo_empresaId_idx" ON "Vehiculo"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_empresaId_placas_key" ON "Vehiculo"("empresaId", "placas");

-- CreateIndex
CREATE UNIQUE INDEX "Chofer_empleadoId_key" ON "Chofer"("empleadoId");

-- CreateIndex
CREATE INDEX "Chofer_empresaId_idx" ON "Chofer"("empresaId");

-- CreateIndex
CREATE INDEX "Mantenimiento_empresaId_idx" ON "Mantenimiento"("empresaId");

-- CreateIndex
CREATE INDEX "Mantenimiento_vehiculoId_idx" ON "Mantenimiento"("vehiculoId");

-- CreateIndex
CREATE INDEX "ClienteFacturacion_empresaId_idx" ON "ClienteFacturacion"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "SerieFiscal_empresaId_serie_key" ON "SerieFiscal"("empresaId", "serie");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_uuidFiscal_key" ON "Factura"("uuidFiscal");

-- CreateIndex
CREATE INDEX "Factura_empresaId_idx" ON "Factura"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_empresaId_serie_folio_key" ON "Factura"("empresaId", "serie", "folio");

-- CreateIndex
CREATE INDEX "Empleado_empresaId_idx" ON "Empleado"("empresaId");

-- CreateIndex
CREATE INDEX "Incidencia_empleadoId_idx" ON "Incidencia"("empleadoId");

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_suscripcionId_fkey" FOREIGN KEY ("suscripcionId") REFERENCES "Suscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_choferAsignadoId_fkey" FOREIGN KEY ("choferAsignadoId") REFERENCES "Chofer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chofer" ADD CONSTRAINT "Chofer_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chofer" ADD CONSTRAINT "Chofer_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteFacturacion" ADD CONSTRAINT "ClienteFacturacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerieFiscal" ADD CONSTRAINT "SerieFiscal_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteFacturacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

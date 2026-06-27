import { z } from "zod";

export const vehiculoSchema = z.object({
  numeroEconomico: z.string().min(1, "Requerido"),
  placas: z.string().min(1, "Requerido"),
  marca: z.string().min(1, "Requerido"),
  modelo: z.string().min(1, "Requerido"),
  anio: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  tipo: z.string().min(1, "Requerido"),
  capacidadCarga: z.coerce.number().optional(),
  odometroKm: z.coerce.number().min(0).default(0),
  polizaSeguro: z.string().optional(),
  vigenciaSeguro: z.string().optional(),
  vigenciaPermiso: z.string().optional(),
  notas: z.string().optional()
});

export const choferSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  licencia: z.string().min(1, "Requerido"),
  tipoLicencia: z.string().optional(),
  vigenciaLicencia: z.string().optional(),
  telefono: z.string().optional()
});

export const mantenimientoSchema = z.object({
  vehiculoId: z.string().min(1, "Selecciona un vehículo"),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO"]),
  descripcion: z.string().min(1, "Requerido"),
  kmProgramado: z.coerce.number().optional(),
  fechaProgramada: z.string().optional(),
  costo: z.coerce.number().optional(),
  taller: z.string().optional(),
  notas: z.string().optional()
});

export const clienteFacturacionSchema = z.object({
  razonSocial: z.string().min(1, "Requerido"),
  rfc: z.string().min(12, "RFC inválido").max(13, "RFC inválido"),
  usoCfdi: z.string().min(1),
  regimenFiscalReceptor: z.string().min(1),
  codigoPostal: z.string().min(5, "Requerido"),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().optional()
});

export const facturaItemSchema = z.object({
  descripcion: z.string().min(1, "Requerido"),
  vehiculoId: z.string().optional(),
  cantidad: z.coerce.number().min(0.01),
  precioUnitario: z.coerce.number().min(0)
});

export const facturaSchema = z.object({
  clienteId: z.string().min(1, "Selecciona un cliente"),
  formaPago: z.string().default("99"),
  metodoPago: z.enum(["PUE", "PPD"]).default("PUE"),
  items: z.array(facturaItemSchema).min(1, "Agrega al menos un concepto")
});

export const empleadoSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  puesto: z.string().min(1, "Requerido"),
  departamento: z.string().min(1).default("Operaciones"),
  fechaIngreso: z.string().min(1, "Requerido"),
  salarioMensual: z.coerce.number().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().optional()
});

export const incidenciaSchema = z.object({
  empleadoId: z.string().min(1),
  tipo: z.enum(["FALTA", "VACACIONES", "PERMISO", "INCAPACIDAD", "RETARDO"]),
  fechaInicio: z.string().min(1, "Requerido"),
  fechaFin: z.string().min(1, "Requerido"),
  motivo: z.string().optional()
});

export const registroEmpresaSchema = z.object({
  empresaNombre: z.string().min(1, "Requerido"),
  nombre: z.string().min(1, "Requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres")
});

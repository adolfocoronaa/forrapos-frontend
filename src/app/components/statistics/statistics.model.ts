// Modelo para datos de series de tiempo (ej. ventas por mes)
export interface DatoTemporal {
  periodo: string; // 'Enero', 'Febrero', 'Lunes', 'Martes', etc.
  total: number;
}

// Modelo para datos agrupados (ej. compras por proveedor)
export interface DatoAgrupado {
  etiqueta: string; // Nombre del proveedor, nombre del producto
  valor: number;
}

// Modelo para la pestaña de Ventas
export interface ReporteVentas {
  ventasPorMes: DatoTemporal[];
  topProductosVendidos: DatoAgrupado[];
  topClientes: DatoAgrupado[];
}

// Modelo para la pestaña de Compras
export interface ReporteCompras {
  comprasPorMes: DatoTemporal[];
  topProductosComprados: DatoAgrupado[];
  topProveedores: DatoAgrupado[];
}

// Modelo para la pestaña de Finanzas (Revenue, Costos)
export interface ReporteFinanciero {
  // Ej: [{periodo: 'Enero', total: 10000}, ...]
  ingresosMensuales: DatoTemporal[];
  // Ej: [{periodo: 'Enero', total: 4000}, ...]
  costosMensuales: DatoTemporal[];
  // Ej: [{periodo: 'Enero', total: 6000}, ...]
  gananciaMensual: DatoTemporal[];
}

// components/dashboard/dashboard-stats.model.ts
export interface DashboardAlert {
  name: string;
  stock: number;
}

export interface RecentSale {
  ventaId: number;
  cliente: string;
  productosResumen: string;
  total: number;
  estado: string;
  fecha: string;
}

export interface Employee {
  id: number;
  nombre: string;
  rol: string;
  isActive: boolean;
}

export interface DashboardStats {
  ventasHoy: number;
  ventasSemana: number;
  itemsVendidosHoy: number;
  ordenesActivas: number;
  alertas: DashboardAlert[];
  recentSales?: RecentSale[];       // opcional para mayor seguridad
  activeEmployees?: Employee[];     // <-- aquí estaba la propiedad que falta
}

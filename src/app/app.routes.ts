import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProductosComponent } from './components/productos/productos.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { ComprasComponent } from './components/compras/compras.component';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { MovimientoInventarioComponent } from './components/movimiento-inventario/movimiento-inventario.component';
import { EstadisticasComponent } from './components/statistics/statistics.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  // 👇 Si no se escribe nada, redirige al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login sin layout
  { path: 'login', component: LoginComponent },

  // Todo lo demás dentro del layout, protegido por AuthGuard
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'venta', component: VentasComponent },
      { path: 'compra', component: ComprasComponent},
      { path: 'productos', component: ProductosComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'inventario', component: MovimientoInventarioComponent },
      { path: 'estadisticas', component: EstadisticasComponent },
      { path: 'configuracion', component: SettingsComponent }
    ]
  },

  // Ruta comodín: redirige a login si no coincide con ninguna
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

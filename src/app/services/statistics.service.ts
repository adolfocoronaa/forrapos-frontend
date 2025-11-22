import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReporteVentas,
  ReporteCompras,
  ReporteFinanciero,
} from '../components/statistics/statistics.model';

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  // Define la URL base de tu API (ajústala a tu backend)
  private apiUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/estadisticas';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el reporte completo de Ventas.
   */
  getReporteVentas(): Observable<ReporteVentas> {
    return this.http.get<ReporteVentas>(`${this.apiUrl}/ventas`);
  }

  /**
   * Obtiene el reporte completo de Compras.
   */
  getReporteCompras(): Observable<ReporteCompras> {
    return this.http.get<ReporteCompras>(`${this.apiUrl}/compras`);
  }

  /**
   * Obtiene el reporte Financiero (Ingresos vs Costos).
   */
  getReporteFinanciero(): Observable<ReporteFinanciero> {
    return this.http.get<ReporteFinanciero>(`${this.apiUrl}/finanzas`);
  }
}

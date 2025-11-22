import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from '../components/ventas/venta.model';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private apiUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/ventas';
  private productosUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/productos';

  constructor(private http: HttpClient) {}

  // Obtener todas las ventas
  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  // Crear una nueva venta
  crearVenta(venta: any): Observable<any> {
    return this.http.post(this.apiUrl, venta);
  }

  // Obtener lista de productos (para el modal de ventas)
  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.productosUrl);
  }

  // Obtener ventas de acuerdo a los filtros
  getVentasFiltradas(filtros: any): Observable<any[]> {
    const params = {
      estado: filtros.estado || '',
      year: filtros.year || '',
      mes: filtros.mes || '',
      minTotal: filtros.minTotal?.toString() || '',
      maxTotal: filtros.maxTotal?.toString() || '',
      producto: filtros.producto || ''
    };
    return this.http.get<any[]>(`${this.apiUrl}/filtradas`, { params });
  }

  actualizarVenta(id: number, venta: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, venta);
  }

  eliminarVenta(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

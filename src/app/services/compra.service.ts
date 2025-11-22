import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Compra } from '../components/compras/compra.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private apiUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/compras';
  private productosUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/productos';
  private proveedoresUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/proveedores';

  constructor(private http: HttpClient) {}

  getCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(this.apiUrl);
  }

  // Obtener ventas de acuerdo a los filtros
  getComprasFiltradas(filtros: any): Observable<any[]> {
    const params = {
      estado: filtros.estado || '',
      year: filtros.year || '',
      mes: filtros.mes || '',
      minTotal: filtros.minTotal?.toString() || '',
      maxTotal: filtros.maxTotal?.toString() || '',
      producto: filtros.producto || ''
    };
    return this.http.get<any[]>('https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/compras/filtradas', { params });
  }

  crearCompra(compra: any): Observable<any> {
    return this.http.post(this.apiUrl, compra);
  }

  eliminarCompra(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  actualizaCompra(id: number, compra: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, compra);
  }

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.productosUrl);
  }

  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(this.proveedoresUrl);
  }
}


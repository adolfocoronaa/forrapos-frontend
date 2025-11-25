/**
 * Servicio ProductoService
 * ...
 * Funcionalidades:
 * - CRUD completo de productos.
 * ...
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Importamos el modelo oficial
import { Producto } from '../components/productos/productos.model';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  public apiUrlBase = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net';
  private apiUrl = `${this.apiUrlBase}/api/productos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de productos
   */
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  /**
   * Obtiene un producto por ID (lo necesitarás para el modal de editar)
   */
  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo producto.
   * Usamos FormData porque tu backend espera [FromForm] e IFormFile.
   */
  createProducto(productoData: FormData): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, productoData);
  }

  /**
   * Actualiza un producto existente.
   * También usa FormData para poder cambiar la imagen.
   */
  updateProducto(id: number, productoData: FormData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, productoData);
  }

  /**
   * Elimina un producto por ID
   */
  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
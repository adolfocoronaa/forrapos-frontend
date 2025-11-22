/**
 * Servicio RegisterService
 * -------------------------
 * Servicio responsable de manejar el registro de nuevos usuarios.
 * Envía una solicitud POST al backend con los datos del nuevo usuario.
 *
 * Funcionalidades:
 * - Registrar un usuario nuevo en el sistema
 *
 * Fecha: 20/03/2025
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Servicio disponible globalmente (singleton)
})
export class RegisterService {

  /**
   * URL del endpoint del backend para registrar usuarios
   */
  private apiUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/auth/register';

  /**
   * Constructor que inyecta el cliente HTTP de Angular
   * @param http - Cliente HTTP para realizar peticiones a la API
   */
  constructor(private http: HttpClient) {}

  /**
   * Envía una solicitud POST al backend para registrar un nuevo usuario
   * @param user - Objeto con la información del nuevo usuario
   * @returns Observable con la respuesta del backend
   */
  register(user: { name: string; email: string; password: string; rol: string }): Observable<any> {
    console.log('Registro usuario:', user); // Debug temporal para ver los datos enviados
    return this.http.post<any>(this.apiUrl, user);
  }
}

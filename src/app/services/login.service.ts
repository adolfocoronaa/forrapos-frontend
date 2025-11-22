/**
 * Servicio LoginService
 * ---------------------
 * Este servicio gestiona la autenticación de usuarios mediante
 * una solicitud HTTP POST al endpoint del backend.
 * 
 * Funcionalidades:
 * - Realizar login de usuario
 * - Enviar credenciales (name y password) al servidor
 * 
 * Fecha: 20/03/2025
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // El servicio estará disponible en toda la aplicación
})
export class LoginService {
  /**
   * URL del endpoint de autenticación del backend
   */
  private apiUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/auth/login';

  /**
   * Constructor que inyecta el cliente HTTP para realizar llamadas a la API
   * @param http - Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Realiza una solicitud POST al backend para iniciar sesión
   * @param name - Nombre de usuario
   * @param password - Contraseña del usuario
   * @returns Observable con la respuesta del backend
   */
  login(name: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { name, password });
  }
}

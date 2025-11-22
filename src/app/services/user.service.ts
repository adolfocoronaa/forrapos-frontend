/**
 * Servicio UserService
 * ---------------------
 * Este servicio gestiona la comunicación con la API backend para
 * operaciones relacionadas con usuarios, como obtener la lista
 * de usuarios y actualizar sus roles.
 * 
 * Funcionalidades:
 * - Obtener todos los usuarios registrados
 * - Actualizar el rol de un usuario específico
 * 
 * Fecha: 20/03/2025
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Hace el servicio disponible globalmente (singleton)
})
export class UserService {

  /**
   * URL base del backend relacionada con autenticación y usuarios
   */
  private apiUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/auth';

  /**
   * Constructor que inyecta el cliente HTTP de Angular
   * @param http - Cliente para realizar peticiones al backend
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de usuarios desde la base de datos
   * @returns Observable con un arreglo de objetos usuario
   */
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  /**
   * Actualiza el rol de un usuario específico en la base de datos
   * @param userId - ID del usuario a modificar
   * @param newRole - Nuevo rol asignado al usuario (por ejemplo: 'Administrador')
   * @param adminEmail - Correo del administrador que realiza el cambio (para validación o auditoría)
   * @returns Observable con la respuesta del backend
   */
  updateUserRole(userId: number, newRole: string, adminEmail: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/update-role/${userId}`,
      { newRole },
      {
        headers: {
          'adminEmail': adminEmail,
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Componente de Administración de Usuarios
 * ----------------------------------------
 * Este componente permite al administrador visualizar y actualizar los roles de los usuarios.
 * Se comunica con un servicio (UserService) que interactúa con una API backend.
 * 
 * Funcionalidades:
 * - Obtener lista de usuarios desde la base de datos.
 * - Modificar el rol de un usuario (Empleado / Administrador).
 * 
 * Fecha de creación: 20/03/2025
 * Dependencias: Angular CommonModule, ReactiveFormsModule, FormsModule
 */

import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service'; // Servicio de usuarios
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin', // Selector usado en el HTML para insertar este componente
  standalone: true,      // Componente independiente (Angular Standalone Component)
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // Módulos necesarios para el funcionamiento del template
  templateUrl: './admin.component.html', // Archivo de plantilla HTML asociado
  styleUrls: ['./admin.component.css']   // Estilos específicos del componente
})
export class AdminComponent implements OnInit {

  /**
   * Lista de usuarios obtenidos desde la API
   */
  users: any[] = [];

  /**
   * Email del administrador, recuperado desde localStorage
   */
  adminEmail = localStorage.getItem('email') || '';

  /**
   * Constructor del componente
   * @param userService - Servicio inyectado que permite la interacción con el backend
   */
  constructor(private userService: UserService) {}

  /**
   * Ciclo de vida de Angular - Se ejecuta al inicializar el componente
   * Llama a la función para cargar usuarios desde la base de datos
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga la lista de usuarios desde el backend y la asigna a la propiedad `users`
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  /**
   * Actualiza el rol de un usuario específico
   * @param userId - ID del usuario que se desea modificar
   * @param newRole - Nuevo rol asignado al usuario (Empleado o Administrador)
   */
  updateRole(userId: number, newRole: string): void {
    this.userService.updateUserRole(userId, newRole, this.adminEmail).subscribe({
      next: () => this.loadUsers(),        // Si es exitoso, recarga la lista de usuarios
      error: err => console.error(err)     // Si ocurre un error, se imprime en consola
    });
  }
}

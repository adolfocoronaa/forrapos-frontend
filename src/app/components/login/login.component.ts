/**
 * Componente LoginComponent
 * --------------------------
 * Componente Angular para gestionar el inicio de sesión y el registro de usuarios.
 * Usa formularios reactivos para validar y enviar datos a los servicios correspondientes.
 * 
 * Funcionalidades:
 * - Validación de formularios (login y registro)
 * - Inicio de sesión con almacenamiento local (recordarme)
 * - Registro con validación de contraseña confirmada
 * - Manejo de errores y mensajes de éxito
 * 
 * Fecha: 20/03/2025
 */

import { Component } from '@angular/core';
import {
  FormGroup, FormBuilder, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { RegisterService } from '../../services/register.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Validador personalizado que comprueba si las contraseñas coinciden
 * @param control - El grupo de formulario que contiene los campos de contraseña
 * @returns Error si las contraseñas no coinciden, null si sí coinciden
 */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { mismatch: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  /**
   * Formulario de inicio de sesión
   */
  loginForm: FormGroup;

  /**
   * Formulario de registro de usuario
   */
  registerForm: FormGroup;

  /**
   * Mensaje de error para mostrar en la interfaz
   */
  errorMessage: string = '';

  /**
   * Mensaje de éxito para mostrar al registrar usuario
   */
  successMessage: string = '';

  /**
   * Constructor del componente
   * @param fb - FormBuilder para construir formularios
   * @param loginService - Servicio de autenticación
   * @param router - Angular Router para navegación
   * @param registerService - Servicio de registro de usuarios
   */
  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private registerService: RegisterService
  ) {
    // Inicialización del formulario de inicio de sesión con validaciones
    this.loginForm = this.fb.group({
      name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Inicialización del formulario de registro con validaciones
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      rol: ['Empleado', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  /**
   * Función para manejar el envío del formulario de login
   * Verifica validez, llama al servicio y redirige si es exitoso
   */
  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, completa correctamente el formulario.';
      return;
    }

    const { name, password, rememberMe } = this.loginForm.value;

    this.loginService.login(name, password).subscribe({
      next: (response) => {
        const { usuario } = response;
        localStorage.setItem('rol', usuario.rol);
        localStorage.setItem('email', usuario.email);
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify({ name }));
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al iniciar sesión.';
      }
    });
  }

  /**
   * Función para manejar el envío del formulario de registro
   * Valida campos, llama al servicio y resetea el formulario si es exitoso
   */
  onSubmitRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, completa correctamente el formulario.';
      return;
    }

    const { name, email, password, rol } = this.registerForm.value;

    this.registerService.register({ name, email, password, rol }).subscribe({
      next: () => {
        this.successMessage = 'Usuario registrado con éxito.';
        this.registerForm.reset();
      },
      error: (err: { error: { message: string } }) => {
        this.errorMessage = err.error?.message || 'Error al registrar usuario.';
      }
    });
  }
}

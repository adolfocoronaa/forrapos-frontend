import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/movimiento-inventario.service';
import { Producto } from '../productos/productos.model';
import { MovimientoInventario } from './movimiento-inventario.model';

@Component({
  selector: 'app-movimiento-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimiento-inventario.component.html',
  styleUrls: ['./movimiento-inventario.component.css']
})
export class MovimientoInventarioComponent implements OnInit {
  productos: Producto[] = [];
  movimientos: MovimientoInventario[] = [];
  isAdmin: boolean = false;

  // Modelo para el formulario
  nuevoMovimiento: MovimientoInventario = {
    productoId: 0,
    tipo: 'ENTRADA',
    cantidad: 1,
    observacion: ''
  };

  cargandoMovimientos = false;
  cargandoProductos = false;
  registrando = false;
  mensaje = '';

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userRole = localStorage.getItem('rol');
      this.isAdmin = userRole === 'Administrador';
    }
    this.cargarProductos();
    this.cargarMovimientos();
  }

  cargarProductos() {
    this.cargandoProductos = true;
    this.inventarioService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargandoProductos = false;
        // si hay productos y no hay seleccionado, selecciona el primero
        if (this.productos.length && this.nuevoMovimiento.productoId === 0) {
          this.nuevoMovimiento.productoId = this.productos[0].id;
        }
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.cargandoProductos = false;
      }
    });
  }

  cargarMovimientos() {
    this.cargandoMovimientos = true;
    this.inventarioService.getMovimientos().subscribe({
      next: (data) => {
        this.movimientos = data;
        this.cargandoMovimientos = false;
      },
      error: (err) => {
        console.error('Error al cargar movimientos', err);
        this.cargandoMovimientos = false;
      }
    });
  }

  registrarMovimiento() {
    // validaciones simples
    if (!this.nuevoMovimiento.productoId || this.nuevoMovimiento.cantidad <= 0) {
      this.mensaje = 'Selecciona un producto y una cantidad válida.';
      return;
    }

    this.registrando = true;
    this.mensaje = '';

    // clonar objeto que se enviará
    const payload: MovimientoInventario = {
      productoId: this.nuevoMovimiento.productoId,
      tipo: this.nuevoMovimiento.tipo,
      cantidad: this.nuevoMovimiento.cantidad,
      observacion: this.nuevoMovimiento.observacion
    };

    this.inventarioService.registrarMovimiento(payload).subscribe({
      next: (resp) => {
        this.registrando = false;
        this.mensaje = 'Movimiento registrado correctamente.';
        // recargar movimientos y productos (para ver stock actualizado)
        this.cargarMovimientos();
        this.cargarProductos();
        // reset formulario manteniendo producto seleccionado
        this.nuevoMovimiento.cantidad = 1;
        this.nuevoMovimiento.observacion = '';
      },
      error: (err) => {
        console.error('Error al registrar movimiento', err);
        this.registrando = false;
        if (err?.error) {
          try { this.mensaje = err.error; } catch { this.mensaje = 'Error al registrar movimiento.'; }
        } else {
          this.mensaje = 'Error al registrar movimiento.';
        }
      }
    });
  }

  // ayuda visual: devolver nombre producto por id
  nombreProducto(id: number) {
    return this.productos.find(p => p.id === id)?.name ?? '—';
  }
}

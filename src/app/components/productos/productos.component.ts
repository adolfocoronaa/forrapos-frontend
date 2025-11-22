import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { Producto } from './productos.model';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
})
export class ProductosComponent implements OnInit, AfterViewInit {
  // --- ¡CAMBIOS AQUÍ! ---
  // 'productos' ahora será la LISTA FILTRADA que se muestra en la tabla.
  productos: Producto[] = [];
  // 'productosCompletos' guardará la lista original del backend.
  productosCompletos: Producto[] = [];
  // 'terminoBusqueda' está vinculado al input del HTML.
  terminoBusqueda: string = '';
  // --- Fin de Cambios ---

  isAdmin: boolean = false;

  // ... (Variables de modales sin cambios)
  private modalProductoElement: any;
  modalProducto: any;
  productoSeleccionado: any = {};
  esModoEdicion: boolean = false;
  archivoImagen: File | null = null;
  imagenPreviewUrl: string | null = null;
  private modalEliminarElement: any;
  modalEliminar: any;
  productoIdAEliminar: number | null = null;
  isDragging: boolean = false;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userRole = localStorage.getItem('rol');
      this.isAdmin = userRole === 'Administrador';
    }
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    // ... (Inicialización de modales sin cambios)
    this.modalProductoElement = document.getElementById('productoModal');
    if (this.modalProductoElement) {
      this.modalProducto = new bootstrap.Modal(this.modalProductoElement, {
        keyboard: false,
        backdrop: 'static',
      });
    }
    this.modalEliminarElement = document.getElementById('eliminarModal');
    if (this.modalEliminarElement) {
      this.modalEliminar = new bootstrap.Modal(this.modalEliminarElement);
    }
  }

  // --- ¡CAMBIOS AQUÍ! ---
  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        // 1. Guarda los datos en la lista 'master'
        this.productosCompletos = data;
        // 2. Aplica el filtro actual (que al inicio estará vacío)
        this.filtrarProductos();
      },
      error: (err) => console.error('Error al obtener productos:', err),
    });
  }

  // --- ¡FUNCIÓN NUEVA! ---
  /**
   * Filtra la lista de productos basándose en el 'terminoBusqueda'.
   * Se ejecuta cada vez que el usuario escribe en el input.
   */
  filtrarProductos(): void {
    // Convierte el término de búsqueda a minúsculas para que no sea sensible
    const filtro = this.terminoBusqueda.toLowerCase().trim();

    // Si no hay filtro, muestra todos los productos
    if (!filtro) {
      // Asigna una copia de la lista completa
      this.productos = [...this.productosCompletos];
    } else {
      // Si hay filtro, aplica la lógica
      this.productos = this.productosCompletos.filter((producto) => {
        // Comprueba si el filtro está en el nombre
        const nombreMatch = producto.name
          .toLowerCase()
          .includes(filtro);
          
        // Comprueba si está en la descripción (manejando si es null)
        const descMatch = producto.descripcion
          ? producto.descripcion.toLowerCase().includes(filtro)
          : false;
          
        // Comprueba si está en la categoría (manejando si es null)
        const catMatch = producto.categoria
          ? producto.categoria.toLowerCase().includes(filtro)
          : false;

        return nombreMatch || descMatch || catMatch;
      });
    }
  }

  // ... (Todas tus demás funciones: getPreviewUrl, onDragOver, onDrop, onFileChange,
  //      guardarProducto, abrirModalCrear, abrirModalEditar, cerrarModalProducto,
  //      abrirModalEliminar, cerrarModalEliminar, confirmarEliminacion...
  //      PERMANECEN EXACTAMENTE IGUAL)

  // ¡Revisión importante!
  // Tus funciones 'guardarProducto' y 'confirmarEliminacion' ya llaman
  // a 'this.cargarProductos()' al terminar.
  // 'cargarProductos' ahora obtiene la nueva lista Y aplica el filtro.
  // ¡Esto es perfecto! El filtro se mantendrá incluso después de editar o crear.

  // ... (El resto de tu lógica de modales) ...

  getPreviewUrl(): string {
    if (this.imagenPreviewUrl) {
      return this.imagenPreviewUrl;
    }
    if (this.esModoEdicion && this.productoSeleccionado.imagenUrl) {
      return this.productoSeleccionado.imagenUrl;
    }
    // Si tienes tu 'placeholder.png' en 'assets/img/placeholder.png'
    // return 'assets/img/placeholder.png';
    // Si no, usa el placeholder web:
    return 'https://placehold.co/300x200/e9ecef/6c757d?text=Sin+Imagen';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.procesarArchivo(file);
      event.dataTransfer.clearData();
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.procesarArchivo(file);
    }
  }

  private procesarArchivo(file: File): void {
    if (file && file.type.startsWith('image/')) {
      this.archivoImagen = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('El archivo seleccionado no es una imagen.');
      this.archivoImagen = null;
      this.imagenPreviewUrl = null;
    }
  }

  guardarProducto(): void {
    const formData = new FormData();
    formData.append('name', this.productoSeleccionado.name);
    formData.append('descripcion', this.productoSeleccionado.descripcion || '');
    formData.append('price', this.productoSeleccionado.price.toString());
    formData.append('stock', this.productoSeleccionado.stock.toString());
    formData.append('categoria', this.productoSeleccionado.categoria || '');

    if (this.archivoImagen) {
      formData.append('imagen', this.archivoImagen, this.archivoImagen.name);
    }

    if (this.esModoEdicion) {
      formData.append('id', this.productoSeleccionado.id.toString());
      this.productoService
        .updateProducto(this.productoSeleccionado.id, formData)
        .subscribe({
          next: () => {
            this.cerrarModalProducto();
            this.cargarProductos(); // Esto recargará Y filtrará
          },
          error: (err) => console.error('Error al actualizar:', err),
        });
    } else {
      this.productoService.createProducto(formData).subscribe({
        next: () => {
          this.cerrarModalProducto();
          this.cargarProductos(); // Esto recargará Y filtrará
        },
        error: (err) => console.error('Error al crear:', err),
      });
    }
  }

  abrirModalCrear(): void {
    this.esModoEdicion = false;
    this.productoSeleccionado = {
      name: '',
      descripcion: '',
      price: 0,
      stock: 0,
      categoria: '',
    };
    this.archivoImagen = null;
    this.imagenPreviewUrl = null;
    this.isDragging = false; // Asegúrate de resetear esto
    this.modalProducto.show();
  }

  abrirModalEditar(producto: Producto): void {
    this.esModoEdicion = true;
    this.productoSeleccionado = { ...producto };
    this.archivoImagen = null;
    this.imagenPreviewUrl = null;
    this.isDragging = false; // Asegúrate de resetear esto
    this.modalProducto.show();
  }

  cerrarModalProducto(): void {
    this.modalProducto.hide();
  }

  abrirModalEliminar(id: number): void {
    this.productoIdAEliminar = id;
    this.modalEliminar.show();
  }

  cerrarModalEliminar(): void {
    this.modalEliminar.hide();
    this.productoIdAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.productoIdAEliminar) {
      this.productoService.deleteProducto(this.productoIdAEliminar).subscribe({
        next: () => {
          this.cerrarModalEliminar();
          this.cargarProductos(); // Esto recargará Y filtrará
        },
        error: (err) => console.error('Error al eliminar:', err),
      });
    }
  }
}


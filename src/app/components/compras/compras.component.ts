
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComprasService } from '../../services/compra.service';
import { Compra, DetalleCompra } from './compra.model';
import { ToastService } from '../../services/toast.service';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})
export class ComprasComponent implements OnInit {
  @ViewChild('modalNuevaCompra') modalElementRef!: ElementRef;
  compras: Compra[] = [];
  comprasFiltradas: Compra[] = [];
  productos: any[] = [];
  proveedores: any[] = [];
  proveedorSeleccionado: number | null = null;
  productoSeleccionado: any = null;
  cantidadSeleccionada: number = 1;
  ivaSeleccionado: number = 0;
  busqueda: string = '';
  paginaActual: number = 1;
  comprasPorPagina: number = 5;
  compraSeleccionada: Compra | null = null;
  yearsArray: number[] = [];
  mostrarModalDetalles: boolean = false;
  isAdmin: boolean = false;
  
  nuevaCompra: any = {
    proveedorId: null,
    detalles: [],
    total: 0
  };

  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  filtroEstado: string = '';
  filtroMes: string = '';
  filtroYear: string = '';
  filtroMin: number | null = null;
  filtroMax: number | null = null;
  filtroProducto: string = '';

  constructor(private comprasService: ComprasService, private toast: ToastService, private pdfService: PdfService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userRole = localStorage.getItem('rol');
      this.isAdmin = userRole === 'Administrador';
    }
    this.cargarCompras();
    this.cargarProductos();
    this.cargarProveedores();
    const currentYear = new Date().getFullYear();
    for (let year = 2025; year <= currentYear; year++) {
      this.yearsArray.push(year);
    }
  }

  cargarCompras() {
    const params: any = {};

    if (this.filtroYear) params.year = this.filtroYear;
    if (this.filtroMes && this.filtroMes !== 'Todo') params.mes = this.meses.indexOf(this.filtroMes) + 1;
    if (this.filtroEstado) params.estado = this.filtroEstado;
    if (this.filtroMin != null) params.minTotal = this.filtroMin;
    if (this.filtroMax != null) params.maxTotal = this.filtroMax;
    if (this.filtroProducto) params.producto = this.filtroProducto;
    this.comprasService.getComprasFiltradas(params).subscribe(data => {
      this.compras = data;
      this.comprasFiltradas = data;
    });
  }
  

  cargarProductos() {
    this.comprasService.getProductos().subscribe(data => {
      this.productos = data;
    });
  }

  cargarProveedores() {
    this.comprasService.getProveedores().subscribe(data => {
      this.proveedores = data;
    });
  }

  agregarProducto() {
    if (!this.productoSeleccionado || this.cantidadSeleccionada < 1) return;

    const subtotal = this.productoSeleccionado.price * this.cantidadSeleccionada;
    const iva = subtotal * (this.ivaSeleccionado / 100);

    const detalle: DetalleCompra = {
      productoId: this.productoSeleccionado.id,
      producto: this.productoSeleccionado.name,
      cantidad: this.cantidadSeleccionada,
      precioUnitario: this.productoSeleccionado.price,
      subtotal,
      iva
    };

    this.nuevaCompra.detalles.push(detalle);
    this.calcularTotal();
    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
    this.ivaSeleccionado = 0;
  }

  quitarProducto(index: number) {
    this.nuevaCompra.detalles.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.nuevaCompra.total = this.nuevaCompra.detalles.reduce((sum: number, d: any) => sum + d.subtotal + d.iva, 0);
  }

  verDetalles(compra: Compra) {
      this.compraSeleccionada = compra;
      this.mostrarModalDetalles = true;
    }

  registrarCompra() {
    if (!this.proveedorSeleccionado || this.nuevaCompra.detalles.length === 0) {
      alert('Selecciona un proveedor y al menos un producto');
      return;
    }

    const payload = {
      proveedorId: this.proveedorSeleccionado,
      detalles: this.nuevaCompra.detalles.map((d: any) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        iva: d.iva
      }))
    };

    this.comprasService.crearCompra(payload).subscribe(() => {
      this.nuevaCompra = { proveedorId: null, detalles: [], total: 0 };
      this.proveedorSeleccionado = null;
      this.cargarCompras();
      alert('Compra registrada correctamente');
    });
  }

  guardarCompra(c: any) {
    const detallesValidos = c.detalles.map((d: any) => ({
      productoId: d.productoId,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario
    }));
  
    const payload = {
      fecha: c.fecha,
      metodoPago: c.metodoPago,
      detalles: detallesValidos
    };
  
    this.comprasService.actualizaCompra(c.id, payload).subscribe(() => {
      this.toast.showSuccess('Compra actualizada exitosamente');
      c.editando = false;
      this.cargarCompras(); // Recarga para ver los nuevos totales
    }, err => {
      this.toast.showError('Error al actualizar la compra');
    });
  }

  aplicarFiltros() {
    const filtros = {
      estado: this.filtroEstado,
      year: this.filtroYear,
      mes: this.filtroMes === 'Todo' || !this.filtroMes
        ? ''
        : this.meses.indexOf(this.filtroMes) + 1, 
      minTotal: this.filtroMin,
      maxTotal: this.filtroMax,
      producto: this.filtroProducto
    };
  
    this.comprasService.getComprasFiltradas(filtros).subscribe(data => {
      this.comprasFiltradas = data;
      this.paginaActual = 1;
    });
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroMes = '';
    this.filtroYear = '';
    this.filtroMin = null;
    this.filtroMax = null;
    this.busqueda = '';
    this.filtroProducto = '';
    this.aplicarFiltros();
  }

  get comprasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.comprasPorPagina;
    return this.comprasFiltradas.slice(inicio, inicio + this.comprasPorPagina);
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
  }

  totalPaginas(): number[] {
    const total = Math.ceil(this.comprasFiltradas.length / this.comprasPorPagina);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  eliminarCompra(compra: Compra) {
      if (confirm(`¿Eliminar compra ${compra.folio}?`)) {
        this.comprasService.eliminarCompra(compra.id).subscribe(() => {
          this.toast.showSuccess('Venta eliminada exitosamente');
          this.cargarCompras();
        }, err => {
          this.toast.showError('Error al eliminar la venta');
        });
      }
    }

  imprimirCompra(compra: Compra) {
    const doc = this.pdfService.generarPdfCompra(compra);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  duplicarCompra(compra: Compra) {
    const proveedorId = Number(
      (compra.proveedorId as any) ??
      (typeof (compra as any).proveedor === 'object' ? (compra as any).proveedor?.id : undefined)
    );

    if (!proveedorId || proveedorId <= 0) {
      this.toast.showError('No se pudo determinar el proveedor de la compra a duplicar');
      return;
    }

    const payload = {
      proveedorId,
      fecha: new Date().toISOString(), // opcional, si quieres “ahora”
      detalles: compra.detalles.map(d => ({
        productoId: Number(d.productoId || this.obtenerProductoIdPorNombre(d.producto)),
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precioUnitario),
        iva: Number(d.iva ?? 0)
      }))
    };

    this.comprasService.crearCompra(payload).subscribe(() => {
      this.toast.showSuccess('Compra duplicada correctamente');
      this.cargarCompras();
    }, () => this.toast.showError('Error al duplicar la compra'));
  }

  // Function to get a product by Name
  obtenerProductoIdPorNombre(nombre: string): number {
    const encontrado = this.productos.find(p => p.name === nombre);
    return encontrado ? encontrado.id : 0; // o lanza error si no se encuentra
  }

  generarReporte(compra: Compra) {
    const doc = this.pdfService.generarPdfCompra(compra);
    doc.save(`compra_${compra.folio}.pdf`);
  }

  // Acciones personalizadas
  editarCompra(compra: any) {
    compra.editando = true;

    // Convertir fecha a formato para datetime-local
    compra.fecha = this.dateFormat(compra.fecha);

    compra.detalles = compra.detalles.map((d: any) => {
    const productoEncontrado = this.productos.find(p => p.name === d.producto);
    return {
      productoId: productoEncontrado ? productoEncontrado.id : null,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      subtotal: d.subtotal
    };
  });
  }

  dateFormat(fechaOriginal: any): string {
    const fecha = new Date(fechaOriginal);
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    const hours = fecha.getHours().toString().padStart(2, '0');
    const minutes = fecha.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  recalcularTotal(compra: any) {
    compra.total = compra.detalles.reduce((sum: number, d: any) => sum + (d.cantidad * d.precioUnitario), 0);
  }  

  // Marcar todos como seleccionados o no
  toggleSeleccionarTodas(event: any) {
    const checked = event.target.checked;
    this.comprasPaginadas.forEach(v => v.seleccionado = checked);
  }
}

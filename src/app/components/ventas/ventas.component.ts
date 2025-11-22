import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VentasService } from '../../services/ventas.service';
import { Venta } from './venta.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { PdfService } from '../../services/pdf.service';




@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  @ViewChild('modalNuevaVenta') modalElementRef!: ElementRef;
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  productos: any[] = [];
  productoSeleccionado: any = null;
  cantidadSeleccionada: number = 1;
  busqueda: string = '';
  paginaActual: number = 1;
  ventasPorPagina: number = 5;
  yearsArray: number[] = [];
  ventaSeleccionada: Venta | null = null;
  mostrarModalDetalles: boolean = false;
  isAdmin: boolean = false;
  
  usoCfdiLabels: { [clave: string]: string } = {
    G01: 'G01 - Adquisición de mercancías',
    G02: 'G02 - Devoluciones, descuentos o bonificaciones',
    G03: 'G03 - Gastos en general',
    I01: 'I01 - Construcciones',
    I02: 'I02 - Mobiliario y equipo de oficina por inversiones',
    I03: 'I03 - Equipo de transporte',
    I04: 'I04 - Equipo de cómputo y accesorios',
    I05: 'I05 - Dados, troqueles, moldes, matrices y herramental',
    I06: 'I06 - Comunicaciones telefónicas',
    I07: 'I07 - Comunicaciones satelitales',
    I08: 'I08 - Otra maquinaria y equipo',
    D01: 'D01 - Honorarios médicos, dentales y gastos hospitalarios',
    D02: 'D02 - Gastos médicos por incapacidad o discapacidad',
    D03: 'D03 - Gastos funerales',
    D04: 'D04 - Donativos',
    D05: 'D05 - Intereses reales pagados por créditos hipotecarios',
    D06: 'D06 - Aportaciones voluntarias al SAR',
    D07: 'D07 - Primas por seguros de gastos médicos',
    D08: 'D08 - Gastos de transportación escolar obligatoria',
    D09: 'D09 - Ahorro o pensiones',
    D10: 'D10 - Servicios educativos (colegiaturas)',
    P01: 'P01 - Por definir'
  };
  
  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  nuevaVenta: any = {
    metodoPago: '',
    total: 0,
    detalles: [],
    cliente: '',
    rfc: '',
    razonSocial: '',
    direccionFiscal: '',
    correoFactura: '',
    usoCfdi: ''
  };

  // Filtros
  filtroEstado: string = '';
  filtroMes: string = '';
  filtroYear: string = '';
  filtroMin: number | null = null;
  filtroMax: number | null = null;
  filtroProducto: string = '';

  constructor(private ventasService: VentasService, private toast: ToastService, private pdfService: PdfService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userRole = localStorage.getItem('rol');
      this.isAdmin = userRole === 'Administrador';
    }
    this.cargarVentas();
    this.cargarProductos();
    const currentYear = new Date().getFullYear();
    for (let year = 2025; year <= currentYear; year++) {
      this.yearsArray.push(year);
    }
  }

  cargarVentas() {
    const params: any = {};
  
    if (this.filtroYear) params.year = this.filtroYear;
    if (this.filtroMes && this.filtroMes !== 'Todo') params.mes = this.meses.indexOf(this.filtroMes) + 1;
    if (this.filtroEstado) params.estado = this.filtroEstado;
    if (this.filtroMin != null) params.minTotal = this.filtroMin;
    if (this.filtroMax != null) params.maxTotal = this.filtroMax;
    if (this.filtroProducto) params.producto = this.filtroProducto;
  
    this.ventasService.getVentasFiltradas(params).subscribe(data => {
      this.ventas = data;
      this.ventasFiltradas = data;
    });
  }
  

  cargarProductos() {
    this.ventasService.getProductos().subscribe(data => {
      this.productos = data;
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
  
    this.ventasService.getVentasFiltradas(filtros).subscribe(data => {
      this.ventasFiltradas = data;
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

  agregarProducto() {
    if (!this.productoSeleccionado || this.cantidadSeleccionada < 1) return;

    const detalle = {
      productoId: this.productoSeleccionado.id,
      producto: this.productoSeleccionado,
      cantidad: this.cantidadSeleccionada,
      precioUnitario: this.productoSeleccionado.price,
      subtotal: this.productoSeleccionado.price * this.cantidadSeleccionada
    };

    this.nuevaVenta.detalles.push(detalle);
    this.calcularTotal();

    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
  }

  quitarProducto(index: number) {
    this.nuevaVenta.detalles.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.nuevaVenta.total = this.nuevaVenta.detalles.reduce((sum: number, d: any) => sum + d.subtotal, 0);
  }

  registrarVenta() {
    const payload = {
      metodoPago: this.nuevaVenta.metodoPago,
      total: this.nuevaVenta.total,
      folio: '', // se generará en backend, solo se necesita que esté presente
      cliente: this.nuevaVenta.cliente || null,
      rfc: this.nuevaVenta.rfc || null,
      razonSocial: this.nuevaVenta.razonSocial || null,
      direccionFiscal: this.nuevaVenta.direccionFiscal || null,
      correoFactura: this.nuevaVenta.correoFactura,
      usoCfdi: this.nuevaVenta.usoCfdi,
      detalles: this.nuevaVenta.detalles.map((d: any) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario
      }))
    };

      // Validación básica
    if (!payload.metodoPago || payload.detalles.length === 0) {
      alert('Debe seleccionar un método de pago y al menos un producto.');
      return;
    }

    this.ventasService.crearVenta(payload).subscribe(() => {
      this.nuevaVenta = { 
        metodoPago: '', 
        total: 0, 
        detalles: [],
        cliente: '',
        rfc: '',
        razonSocial: '',
        direccionFiscal: '',
        correoFactura: '',
        usoCfdi: '',
      };
    
      this.cargarVentas();
    }, (error) => {
      alert('Error: Verifica los datos ingresados.');
    });
  }

  // Paginación
  get ventasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.ventasPorPagina;
    return this.ventasFiltradas.slice(inicio, inicio + this.ventasPorPagina);
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
  }

  totalPaginas(): number[] {
    const total = Math.ceil(this.ventasFiltradas.length / this.ventasPorPagina);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Marcar todos como seleccionados o no
  toggleSeleccionarTodas(event: any) {
    const checked = event.target.checked;
    this.ventasPaginadas.forEach(v => v.seleccionado = checked);
  }

  // Acciones personalizadas
  editarVenta(venta: any) {
    venta.editando = true;

    // Convertir fecha a formato para datetime-local
    venta.fecha = this.dateFormat(venta.fecha);

    venta.detalles = venta.detalles.map((d: any) => {
      const productoEncontrado = this.productos.find(p => p.name === d.producto);
      return {
        productoId: productoEncontrado ? productoEncontrado.id : null,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal: d.subtotal
      };
    });
  }

  generarReporte(venta: Venta) {
    const doc = this.pdfService.generarPdf(venta);
    doc.save(`venta_${venta.folio}.pdf`);
  }


  eliminarVenta(venta: Venta) {
    if (confirm(`¿Eliminar venta ${venta.folio}?`)) {
      this.ventasService.eliminarVenta(venta.id).subscribe(() => {
        this.toast.showSuccess('Venta eliminada exitosamente');
        this.cargarVentas();
      }, err => {
        this.toast.showError('Error al eliminar la venta');
      });
    }
  }

  verDetalles(venta: Venta) {
    this.ventaSeleccionada = venta;
    this.mostrarModalDetalles = true;
  }
  
  duplicarVenta(venta: Venta) {
    const payload = {
      metodoPago: venta.estado === "Completado" ? venta.metodoPago : '',
      cliente: venta.cliente,
      rfc: venta.rfc,
      razonSocial: venta.razonSocial,
      direccionFiscal: venta.direccionFiscal,
      correoFactura: venta.correoFactura,
      usoCfdi: venta.usoCfdi,
      detalles: venta.detalles.map(d => ({
        productoId: this.obtenerProductoIdPorNombre(d.producto),
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario
      }))
    };
  
    this.ventasService.crearVenta(payload).subscribe(() => {
      // Se despliega el mensaje que se pudo duplicar la venta exitosamente
      this.toast.showSuccess('Venta duplicada correctamente');
      this.cargarVentas(); // Recarga para ver la nueva venta al final
    }, err => {
      this.toast.showError('Error al duplicar la venta');
    });
  }
  
  
  enviarPorCorreo(venta: Venta) {
    // Abrir cliente de correo con datos prellenados
    const correo = encodeURIComponent(venta.correoFactura || '');
    const asunto = encodeURIComponent(`Factura de venta ${venta.folio}`);
    const cuerpo = encodeURIComponent(`Hola,\n\nAdjunto la factura correspondiente a la venta ${venta.folio}.\n\nPor favor revisa el archivo PDF descargado.\n\nSaludos.`);
    window.location.href = `mailto:${correo}?subject=${asunto}&body=${cuerpo}`;
  }
  
  imprimirVenta(venta: Venta) {
    const doc = this.pdfService.generarPdf(venta);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }
  
  guardarVenta(v: any) {
    const detallesValidos = v.detalles.map((d: any) => ({
      productoId: d.productoId,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario
    }));
  
    const payload = {
      fecha: v.fecha,
      metodoPago: v.metodoPago,
      detalles: detallesValidos
    };
  
    this.ventasService.actualizarVenta(v.id, payload).subscribe(() => {
      this.toast.showSuccess('Venta actualizada exitosamente');
      v.editando = false;
      this.cargarVentas(); // Recarga para ver los nuevos totales
    }, err => {
      this.toast.showError('Error al actualizar la venta');
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

  recalcularTotal(venta: any) {
    venta.total = venta.detalles.reduce((sum: number, d: any) => sum + (d.cantidad * d.precioUnitario), 0);
  }  

  // Function to get a product by Name
  obtenerProductoIdPorNombre(nombre: string): number {
    const encontrado = this.productos.find(p => p.name === nombre);
    return encontrado ? encontrado.id : 0; // o lanza error si no se encuentra
  }
}

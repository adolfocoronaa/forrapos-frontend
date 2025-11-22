import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentasComponent } from './ventas.component';
import { VentasService } from '../../services/ventas.service';
import { ToastService } from '../../services/toast.service';
import { PdfService } from '../../services/pdf.service';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';


describe('VentasComponent', () => {
  let component: VentasComponent;
  let fixture: ComponentFixture<VentasComponent>;
  let mockVentasService: jasmine.SpyObj<VentasService>;
  let mockToast: jasmine.SpyObj<ToastService>;
  let mockPdf: jasmine.SpyObj<PdfService>;

  beforeEach(async () => {
    mockVentasService = jasmine.createSpyObj('VentasService', [
      'getVentasFiltradas',
      'getProductos',
      'crearVenta',
      'actualizarVenta',
      'eliminarVenta'
    ]);
    mockToast = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    mockPdf = jasmine.createSpyObj('PdfService', ['generarPdf']);

    mockVentasService.getVentasFiltradas.and.returnValue(of([]));
    mockVentasService.getProductos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [VentasComponent],
      providers: [
        { provide: VentasService, useValue: mockVentasService },
        { provide: ToastService, useValue: mockToast },
        { provide: PdfService, useValue: mockPdf },
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería ejecutar aplicarFiltros al hacer clic en el botón Filtrar', () => {
    spyOn(component, 'aplicarFiltros');
    const boton = fixture.debugElement.query(By.css('button.btn.btn-primary'));
    boton.nativeElement.click();
    fixture.detectChanges();
    expect(component.aplicarFiltros).toHaveBeenCalled();
  });

  it('debería ejecutar registrarVenta al hacer submit en el formulario', () => {
    spyOn(component, 'registrarVenta');
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', {});
    fixture.detectChanges();
    expect(component.registrarVenta).toHaveBeenCalled();
  });

  it('debería ejecutar eliminarVenta al hacer clic en el botón del menú de acciones', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const venta = {
      id: 1,
      folio: 'FORRA-0001',
      fecha: '2025-05-14',
      total: 200,
      estado: 'Completado',
      metodoPago: 'Efectivo',
      cliente: 'Juan',
      rfc: 'JUAP800101XXX',
      direccionFiscal: 'Calle Falsa 123',
      correoFactura: 'juan@example.com',
      usoCfdi: 'G03',
      razonSocial: 'Empresa S.A.',
      seleccionado: false,
      editando: false,
      detalles: [
        {
          productoId: 1,
          producto: 'Maíz',
          cantidad: 2,
          precioUnitario: 100,
          subtotal: 200
        }
      ]
    };
    component.ventasFiltradas = [venta];
    component.paginaActual = 1;
    mockVentasService.eliminarVenta.and.returnValue(of({}));
    fixture.detectChanges();

    component.eliminarVenta(venta);

    expect(mockVentasService.eliminarVenta).toHaveBeenCalledWith(1);
    expect(mockToast.showSuccess).toHaveBeenCalled();
  });

  it('debería calcular correctamente el total', () => {
    component.nuevaVenta.detalles = [
      { subtotal: 100 },
      { subtotal: 200 }
    ];
    component.calcularTotal();
    expect(component.nuevaVenta.total).toBe(300);
  });

  it('debería agregar un producto correctamente', () => {
    component.productoSeleccionado = { id: 1, price: 100 };
    component.cantidadSeleccionada = 2;
    component.nuevaVenta.detalles = [];
    component.agregarProducto();
    expect(component.nuevaVenta.detalles.length).toBe(1);
    expect(component.nuevaVenta.total).toBe(200);
  });

  it('debería llamar al servicio para registrar una venta', () => {
    component.nuevaVenta = {
      metodoPago: 'Efectivo',
      total: 100,
      detalles: [{ productoId: 1, cantidad: 1, precioUnitario: 100 }],
      cliente: '', rfc: '', razonSocial: '', direccionFiscal: '', correoFactura: '', usoCfdi: '',
      seleccionado: false,
      editando: false
    };
    mockVentasService.crearVenta.and.returnValue(of({}));
    component.registrarVenta();
    expect(mockVentasService.crearVenta).toHaveBeenCalled();
    expect(component.nuevaVenta.total).toBe(0);
  });

  it('debería cargar ventas filtradas desde el servicio', () => {
    mockVentasService.getVentasFiltradas.and.returnValue(of([]));
    component.filtroMes = 'Enero';
    component.filtroYear = '2024';
    component.cargarVentas();
    expect(mockVentasService.getVentasFiltradas).toHaveBeenCalled();
  });

  it('debería quitar un producto de la lista', () => {
    component.nuevaVenta.detalles = [
      { productoId: 1, subtotal: 100 },
      { productoId: 2, subtotal: 200 }
    ];
    component.quitarProducto(0);
    expect(component.nuevaVenta.detalles.length).toBe(1);
    expect(component.nuevaVenta.total).toBe(200);
  });

  it('debería duplicar una venta correctamente', () => {
    const ventaMock = {
      estado: 'Completado',
      metodoPago: 'Efectivo',
      cliente: 'Juan',
      rfc: 'ABC123',
      razonSocial: 'Empresa S.A.',
      direccionFiscal: 'Calle Falsa 123',
      correoFactura: 'correo@ejemplo.com',
      usoCfdi: 'G03',
      detalles: [
        { producto: 'Producto X', cantidad: 2, precioUnitario: 50 }
      ]
    };

    spyOn(component, 'obtenerProductoIdPorNombre').and.returnValue(1);
    mockVentasService.crearVenta.and.returnValue(of({}));

    component.duplicarVenta(ventaMock as any);

    expect(mockVentasService.crearVenta).toHaveBeenCalled();
    expect(mockToast.showSuccess).toHaveBeenCalled();
  });

  it('debería guardar una venta editada', () => {
    const venta = {
      id: 1,
      fecha: '2025-05-14T12:00',
      metodoPago: 'Tarjeta',
      detalles: [
        { productoId: 1, cantidad: 2, precioUnitario: 100 }
      ],
      editando: true
    };

    mockVentasService.actualizarVenta.and.returnValue(of({}));

    component.guardarVenta(venta);

    expect(mockVentasService.actualizarVenta).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(mockToast.showSuccess).toHaveBeenCalled();
    expect(venta.editando).toBeFalse();
  });

  it('debería eliminar una venta tras confirmar', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const venta = { id: 1, folio: 'A001' } as any;
    mockVentasService.eliminarVenta.and.returnValue(of({}));

    component.eliminarVenta(venta);

    expect(mockVentasService.eliminarVenta).toHaveBeenCalledWith(1);
    expect(mockToast.showSuccess).toHaveBeenCalled();
  });
});

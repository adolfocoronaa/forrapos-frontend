import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VentasService } from './ventas.service';
import { Venta } from '../components/ventas/venta.model';

describe('VentasService', () => {
  let service: VentasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VentasService]
    });

    service = TestBed.inject(VentasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería obtener todas las ventas', () => {
    const mockVentas: Venta[] = [
      {
        id: 1,
        folio: 'FORRA-0001',
        fecha: '2025-05-14',
        total: 200,
        estado: 'Completado',
        metodoPago: 'Efectivo',
        cliente: 'Juan Pérez',
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
      }
    ];

    service.getVentas().subscribe(ventas => {
      expect(ventas.length).toBe(1);
      expect(ventas).toEqual(mockVentas);
    });

    const req = httpMock.expectOne('http://localhost:5233/api/ventas');
    expect(req.request.method).toBe('GET');
    req.flush(mockVentas);
  });

  it('debería crear una nueva venta', () => {
    const nuevaVenta = { metodoPago: 'Efectivo' };

    service.crearVenta(nuevaVenta).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:5233/api/ventas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevaVenta);
    req.flush({ success: true });
  });

  it('debería obtener productos', () => {
    const mockProductos = [{ id: 1, name: 'Maíz' }];

    service.getProductos().subscribe(productos => {
      expect(productos).toEqual(mockProductos);
    });

    const req = httpMock.expectOne('http://localhost:5233/api/productos');
    expect(req.request.method).toBe('GET');
    req.flush(mockProductos);
  });

  it('debería obtener ventas filtradas', () => {
    const filtros = { estado: 'Completado', year: '2024', mes: '5' };
    const resultadoEsperado: Venta[] = [
      {
        id: 1,
        folio: 'FORRA-0001',
        fecha: '2025-05-14',
        total: 200,
        estado: 'Completado',
        metodoPago: 'Efectivo',
        cliente: 'Juan Pérez',
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
      }
    ];

    service.getVentasFiltradas(filtros).subscribe(ventas => {
      expect(ventas).toEqual(resultadoEsperado);
    });

    const req = httpMock.expectOne(r => r.url === 'http://localhost:5233/api/ventas/filtradas');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('estado')).toBe('Completado');
    expect(req.request.params.get('year')).toBe('2024');
    expect(req.request.params.get('mes')).toBe('5');
    req.flush(resultadoEsperado);
  });

  it('debería actualizar una venta', () => {
    const id = 5;
    const data = { total: 500 };

    service.actualizarVenta(id, data).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`http://localhost:5233/api/ventas/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush({ success: true });
  });

  it('debería eliminar una venta', () => {
    const id = 3;

    service.eliminarVenta(id).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`http://localhost:5233/api/ventas/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});

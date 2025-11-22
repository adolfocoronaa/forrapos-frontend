export interface Venta {
  id: number;
  folio: string;
  fecha: string; // o Date
  total: number;
  estado: string;
  detalles: DetalleVenta[];
  seleccionado: boolean;
  metodoPago: string;
  editando: boolean;

  // Campos fiscales
  cliente?: string;
  rfc?: string;
  direccionFiscal?: string;
  correoFactura?: string;
  usoCfdi?: string;
  razonSocial?: string;
}
  
  export interface DetalleVenta {
    productoId: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }
  
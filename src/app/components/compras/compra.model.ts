export interface Compra {
  id: number;
  fecha: string;
  total: number;
  estado: string;
  folio: string;
  metodoPago: string;
  proveedorId: number;
  proveedor?: string;
  editando: boolean;
  seleccionado: boolean;

  detalles: DetalleCompra[];
}

export interface DetalleCompra {
  productoId: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  iva: number;
}

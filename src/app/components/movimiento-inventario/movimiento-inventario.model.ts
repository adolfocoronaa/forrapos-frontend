import { Producto } from "../productos/productos.model";

export interface MovimientoInventario {
    id?: number;
    productoId: number;
    producto?: Producto;
    tipo: 'ENTRADA' | 'SALIDA' | string;
    cantidad: number;
    fecha?: string; // ISO date string
    observacion?: string | null;
    usuarioId?: number | null;
}
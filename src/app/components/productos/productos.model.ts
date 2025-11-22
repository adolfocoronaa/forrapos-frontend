export interface Producto {
  id: number;
  name: string;
  descripcion: string;
  price: number;
  stock: number;
  imagenUrl?: string | null;
  categoria?: string | null;
}
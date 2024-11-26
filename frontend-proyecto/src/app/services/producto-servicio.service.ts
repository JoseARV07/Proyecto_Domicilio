import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface ProductoServicio {
  id_producto_servicio: number;
  id_proveedor: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponibilidad: boolean;
  [key: string]: string | number | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoServicioService {
  private apiUrl = 'http://localhost:3000/api/productos-servicios';

  constructor(private http: HttpClient) { }

  getProductosServicios(): Observable<ProductoServicio[]> {
    return this.http.get<ProductoServicio[]>(this.apiUrl);
  }

  getProductoServicio(id: number): Observable<ProductoServicio> {
    return this.http.get<ProductoServicio>(`${this.apiUrl}/${id}`);
  }

  createProductoServicio(productoServicio: Omit<ProductoServicio, 'id_producto_servicio'>): Observable<ProductoServicio> {
    return this.http.post<ProductoServicio>(this.apiUrl, productoServicio);
  }

  updateProductoServicio(productoServicio: ProductoServicio): Observable<ProductoServicio> {
    return this.http.put<ProductoServicio>(`${this.apiUrl}/${productoServicio.id_producto_servicio}`, productoServicio);
  }

  deleteProductoServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ocultarProductoServicio(id: number): Observable<ProductoServicio> {
    return this.http.patch<ProductoServicio>(`${this.apiUrl}/${id}/ocultar`, {});
  }

  cambiarDisponibilidadProductoServicio(id: number, disponibilidad: boolean): Observable<ProductoServicio> {
    return this.http.patch<ProductoServicio>(`${this.apiUrl}/${id}/disponibilidad`, { disponibilidad });
  }

  getProductosServiciosPorIds(ids: number[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/productos-servicios/por-ids`, { ids });
  }
}

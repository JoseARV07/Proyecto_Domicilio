import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetallePedidoService {
  private apiUrl = 'http://localhost:3000/api/detalles-pedido';

  constructor(private http: HttpClient) { }

  getDetallesPedido(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getDetallePedido(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createDetallePedido(detallePedido: any): Observable<any> {
    return this.http.post(this.apiUrl, detallePedido);
  }

  updateDetallePedido(detallePedido: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${detallePedido.id_detalle}`, detallePedido);
  }

  deleteDetallePedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  ocultarDetallePedido(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/ocultar`, {});
  }

  getDetallesPorPedido(idPedido: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedido/${idPedido}`);
  }
}

export interface DetallePedido {
  id_detalle_pedido?: number;
  id_pedido: number;
  id_producto_servicio: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

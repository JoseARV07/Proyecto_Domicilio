import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pedido {
  id_pedido: number;
  id_usuario: number;
  id_proveedor: number;
  id_repartidor: number | null;
  estado_pedido: string;
  direccion_entrega: string;
  costo_domicilio: number | null;
  metodo_pago: string;
  fecha_hora_solicitud: Date;
  fecha_hora_entrega: Date | null;
  total: number;
  // Cualquier otra propiedad que pueda tener tu interfaz Pedido
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = 'http://localhost:3000/api/pedidos';

  constructor(private http: HttpClient) { }

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  createPedido(pedido: Omit<Pedido, 'id_pedido'>): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  updatePedido(pedido: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${pedido.id_pedido}`, pedido);
  }

  deletePedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getPedidosPorUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos/usuario/${idUsuario}`);
  }
}

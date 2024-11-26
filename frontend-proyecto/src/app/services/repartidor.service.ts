import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Repartidor {
  id_repartidor: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  tipo_vehiculo: string;
  estado_disponibilidad: boolean;
  [key: string]: string | number | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RepartidorService {
  private apiUrl = 'http://localhost:3000/api/repartidores';

  constructor(private http: HttpClient) { }

  getRepartidores(incluirOcultos: boolean = false): Observable<Repartidor[]> {
    const url = incluirOcultos ? `${this.apiUrl}?incluirOcultos=true` : this.apiUrl;
    return this.http.get<Repartidor[]>(url);
  }

  createRepartidor(repartidor: Repartidor): Observable<Repartidor> {
    return this.http.post<Repartidor>(this.apiUrl, repartidor);
  }

  getRepartidor(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateRepartidor(repartidor: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${repartidor.id_repartidor}`, repartidor);
  }

  deleteRepartidor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  ocultarRepartidor(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/ocultar`, {});
  }
}

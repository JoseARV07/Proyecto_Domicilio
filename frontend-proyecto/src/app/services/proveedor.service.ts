import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private apiUrl = 'http://localhost:3000/api/proveedores';

  constructor(private http: HttpClient) { }

  getProveedores(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getProveedor(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createProveedor(proveedor: any): Observable<any> {
    return this.http.post(this.apiUrl, proveedor);
  }

  updateProveedor(proveedor: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${proveedor.id_proveedor}`, proveedor);
  }

  deleteProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  ocultarProveedor(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/ocultar`, {});
  }
}

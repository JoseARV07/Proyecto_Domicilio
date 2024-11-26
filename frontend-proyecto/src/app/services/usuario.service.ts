import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_registro: Date;
  oculto?: boolean;  // Añadir esta línea
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/api/usuarios';  
  private usuarioActualizadoSource = new Subject<Usuario>();

  usuarioActualizado$ = this.usuarioActualizadoSource.asObservable();

  constructor(private http: HttpClient) { }

  getUsuarios(incluirOcultos: boolean = false): Observable<Usuario[]> {
    const url = incluirOcultos ? `${this.apiUrl}?incluirOcultos=true` : this.apiUrl;
    return this.http.get<Usuario[]>(url);
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  updateUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${usuario.id_usuario}`, usuario).pipe(
      tap((usuarioActualizado) => {
        console.log('Usuario actualizado en el servicio:', usuarioActualizado);
        this.usuarioActualizadoSource.next(usuarioActualizado);
      })
    );
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  ocultarUsuario(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/ocultar`, {});
  }
}

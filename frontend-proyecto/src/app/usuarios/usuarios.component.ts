import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UsuarioService } from '../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppComponent } from '../app.component';
import * as XLSX from 'xlsx';
import { ToastModule } from 'primeng/toast';

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_registro: Date;
  oculto?: boolean;
  [key: string]: any;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, InputSwitchModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, DatePipe, MessageService],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  mostrandoOcultos: boolean = false;
  mostrarModal: boolean = false;
  cerrandoModal: boolean = false;
  usuarioSeleccionado: Usuario = this.nuevoUsuario();
  cargando: boolean = true;
  searchTerm: string = '';
  columnasVisibles: string[] = ['id_usuario', 'nombre', 'apellido', 'email', 'telefono', 'direccion', 'fecha_registro'];
  columnaOrdenada: string = '';
  ordenAscendente: boolean = true;
  paginaActual: number = 1;
  totalPaginas: number = 1;

  constructor(
    private usuarioService: UsuarioService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.mostrandoOcultos = false;
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuarioService.getUsuarios(this.mostrandoOcultos).subscribe(
      (data) => {
        this.usuarios = data;
        this.aplicarFiltrosYOrdenamiento();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
        this.messageService.add({key: 'bc', severity:'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios'});
        this.cargando = false;
      }
    );
  }

  onSearch() {
    this.aplicarFiltrosYOrdenamiento();
  }

  aplicarFiltrosYOrdenamiento() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      // Mostrar solo usuarios ocultos si mostrandoOcultos es true
      const cumpleFiltroOculto = this.mostrandoOcultos ? usuario.oculto : !usuario.oculto;
      const cumpleBusqueda = Object.values(usuario).some(value =>
        value && value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      return cumpleFiltroOculto && cumpleBusqueda;
    });

    if (this.columnaOrdenada) {
      this.usuariosFiltrados.sort((a, b) => {
        if (a[this.columnaOrdenada] < b[this.columnaOrdenada]) return this.ordenAscendente ? -1 : 1;
        if (a[this.columnaOrdenada] > b[this.columnaOrdenada]) return this.ordenAscendente ? 1 : -1;
        return 0;
      });
    }

    this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / 10);
    this.paginaActual = 1;
  }

  ordenar(columna: string) {
    if (this.columnaOrdenada === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrdenada = columna;
      this.ordenAscendente = true;
    }
    this.aplicarFiltrosYOrdenamiento();
  }

  cambiarPagina(direccion: number) {
    this.paginaActual += direccion;
    if (this.paginaActual < 1) this.paginaActual = 1;
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
  }

  abrirFormularioCreacion() {
    this.usuarioSeleccionado = this.nuevoUsuario();
    this.mostrarModal = true;
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioSeleccionado = { ...usuario };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.cerrandoModal = true;
    setTimeout(() => {
      this.mostrarModal = false;
      this.cerrandoModal = false;
      this.usuarioSeleccionado = this.inicializarUsuario();
    }, 90);
  }

  guardarUsuario() {
    if (this.formularioValido()) {
      if (this.usuarioSeleccionado.id_usuario) {
        this.usuarioService.updateUsuario(this.usuarioSeleccionado).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity:'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente'});
            this.cargarUsuarios();
            this.cerrarModal();
          },
          (error) => {
            console.error('Error al actualizar el usuario:', error);
            this.messageService.add({key: 'bc', severity:'error', summary: 'Error', detail: 'No se pudo actualizar el usuario'});
          }
        );
      } else {
        this.usuarioService.createUsuario(this.usuarioSeleccionado).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity:'success', summary: 'Éxito', detail: 'Usuario creado correctamente'});
            this.cargarUsuarios();
            this.cerrarModal();
          },
          (error) => {
            console.error('Error al crear el usuario:', error);
            this.messageService.add({key: 'bc', severity:'error', summary: 'Error', detail: 'No se pudo crear el usuario'});
          }
        );
      }
    } else {
      this.messageService.add({key: 'bc', severity:'warn', summary: 'Formulario incompleto', detail: 'Por favor, complete todos los campos requeridos'});
    }
  }

  eliminarUsuario(id_usuario: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este usuario?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptLabel: ' ',
      rejectLabel: ' ',
      acceptButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-success',
      rejectButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-danger',
      accept: () => {
        this.usuarioService.deleteUsuario(id_usuario).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity:'success', summary: 'Éxito', detail: 'Usuario eliminado correctamente'});
            this.cargarUsuarios();
          },
          (error) => {
            console.error('Error al eliminar el usuario:', error);
            this.messageService.add({key: 'bc', severity:'error', summary: 'Error', detail: 'No se pudo eliminar el usuario'});
          }
        );
      },
      reject: () => {
        this.messageService.add({key: 'bc', severity:'info', summary: 'Cancelado', detail: 'Eliminación cancelada'});
      }
    });
  }

  toggleOcultos() {
    this.mostrandoOcultos = !this.mostrandoOcultos;
    this.cargarUsuarios(); // Recargar usuarios al cambiar el estado
  }

  nuevoUsuario(): Usuario {
    return {
      id_usuario: 0,
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      fecha_registro: new Date(),
      oculto: false
    };
  }

  formularioValido(): boolean {
    return !!(this.usuarioSeleccionado.nombre && 
              this.usuarioSeleccionado.apellido && 
              this.usuarioSeleccionado.email && 
              this.usuarioSeleccionado.telefono && 
              this.usuarioSeleccionado.direccion);
  }

  formatearFecha(fecha: Date | string): string {
    return this.datePipe.transform(fecha, 'dd/MM/yyyy HH:mm') || '';
  }

  obtenerNombreColumna(columna: string): string {
    const nombresColumnas: { [key: string]: string } = {
      'id_usuario': 'ID',
      'nombre': 'Nombre',
      'apellido': 'Apellido',
      'email': 'Correo Electrónico',
      'telefono': 'Teléfono',
      'direccion': 'Dirección',
      'fecha_registro': 'Fecha de Registro'
    };
    return nombresColumnas[columna] || columna;
  }

  exportarUsuarios() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.usuariosFiltrados);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "usuarios");
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = fileName + '.xlsx';
    link.click();
  }

  inicializarUsuario(): Usuario {
    return {
      id_usuario: 0,
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      fecha_registro: new Date(),
      oculto: false
    };
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProveedorService } from '../services/proveedor.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx'; 

interface Proveedor {
  id_proveedor: number;
  nombre: string;
  tipo_servicio: string;
  direccion: string;
  telefono: string;
  email: string;
  horario_atencion: string;
  oculto: boolean;
  [key: string]: string | number | boolean; // Añade esta línea
}

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, InputSwitchModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  mostrandoOcultos: boolean = false;
  mostrarModal: boolean = false;
  proveedorSeleccionado: Proveedor = this.nuevoProveedor();
  cargando: boolean = true;
  searchTerm: string = '';
  columnasVisibles: string[] = ['id_proveedor', 'nombre', 'tipo_servicio', 'direccion', 'telefono', 'email', 'horario_atencion'];
  columnaOrdenada: string = '';
  ordenAscendente: boolean = true;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalPaginas: number = 1;

  constructor(
    private proveedorService: ProveedorService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.cargando = true;
    this.proveedorService.getProveedores().subscribe(
      (data) => {
        this.proveedores = data;
        this.aplicarFiltrosYOrdenamiento();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar proveedores:', error);
        this.cargando = false;
      }
    );
  }

  onSearch() {
    this.aplicarFiltrosYOrdenamiento();
  }

  toggleOcultos() {
    this.mostrandoOcultos = !this.mostrandoOcultos;
    this.cargarProveedores();
  }

  aplicarFiltrosYOrdenamiento() {
    let resultados = this.proveedores;

    if (this.searchTerm) {
      resultados = resultados.filter(proveedor =>
        Object.values(proveedor).some(value =>
          value && value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }

    if (this.columnaOrdenada) {
      resultados.sort((a, b) => {
        const valorA = a[this.columnaOrdenada as keyof Proveedor];
        const valorB = b[this.columnaOrdenada as keyof Proveedor];
        if (typeof valorA === 'string' && typeof valorB === 'string') {
          return this.ordenAscendente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        }
        if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
        if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
        return 0;
      });
    }

    this.totalPaginas = Math.ceil(resultados.length / this.elementosPorPagina);
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    this.proveedoresFiltrados = resultados.slice(inicio, inicio + this.elementosPorPagina);
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
    this.aplicarFiltrosYOrdenamiento();
  }

  exportarProveedores() {
    const datosParaExportar = this.proveedores.map(proveedor => ({
      ID: proveedor.id_proveedor,
      Nombre: proveedor.nombre,
      'Tipo de Servicio': proveedor.tipo_servicio,
      Dirección: proveedor.direccion,
      Teléfono: proveedor.telefono,
      Email: proveedor.email,
      'Horario de Atención': proveedor.horario_atencion
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    XLSX.writeFile(wb, 'proveedores.xlsx');
  }

  eliminarProveedor(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este proveedor? Esta acción no se puede deshacer.',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptLabel: ' ',
      rejectLabel: ' ',
      acceptButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-success',
      rejectButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-danger',
      accept: () => {
        this.proveedorService.deleteProveedor(id).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity: 'success', summary: 'Proveedor Eliminado', detail: 'El proveedor ha sido eliminado correctamente de la base de datos.'});
            this.cargarProveedores();
          },
          (error) => {
            this.messageService.add({key: 'bc', severity: 'error', summary: 'Error de Eliminación', detail: 'Hubo un problema al eliminar el proveedor. Por favor, inténtelo de nuevo.'});
            console.error('Error al eliminar proveedor:', error);
          }
        );
      },
      reject: () => {
        this.messageService.add({key: 'bc', severity: 'info', summary: 'Eliminación Cancelada', detail: 'La eliminación del proveedor ha sido cancelada.'});
      }
    });
  }

  editarProveedor(proveedor: Proveedor) {
    this.proveedorSeleccionado = { ...proveedor };
    this.mostrarModal = true;
  }

  abrirFormularioCreacion() {
    this.proveedorSeleccionado = this.nuevoProveedor();
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.proveedorSeleccionado = this.nuevoProveedor();
  }

  guardarProveedor() {
    if (this.formularioValido()) {
      if (this.proveedorSeleccionado.id_proveedor) {
        // Actualizar proveedor existente
        this.proveedorService.updateProveedor(this.proveedorSeleccionado).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity: 'success', summary: 'Proveedor Actualizado', detail: 'El proveedor se ha actualizado correctamente en la base de datos.'});
            this.cargarProveedores();
            this.cerrarModal();
          },
          (error) => {
            this.messageService.add({key: 'bc', severity: 'error', summary: 'Error de Actualización', detail: 'Hubo un problema al actualizar el proveedor. Por favor, inténtelo de nuevo.'});
            console.error('Error al actualizar proveedor:', error);
          }
        );
      } else {
        // Crear nuevo proveedor
        this.proveedorService.createProveedor(this.proveedorSeleccionado).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity: 'success', summary: 'Proveedor Creado', detail: 'El nuevo proveedor se ha creado correctamente en la base de datos.'});
            this.cargarProveedores();
            this.cerrarModal();
          },
          (error) => {
            this.messageService.add({key: 'bc', severity: 'error', summary: 'Error de Creación', detail: 'Hubo un problema al crear el nuevo proveedor. Por favor, inténtelo de nuevo.'});
            console.error('Error al crear proveedor:', error);
          }
        );
      }
    } else {
      this.messageService.add({key: 'bc', severity: 'warn', summary: 'Formulario Incompleto', detail: 'Por favor, complete todos los campos requeridos antes de guardar.'});
    }
  }

  nuevoProveedor(): Proveedor {
    return {
      id_proveedor: 0,
      nombre: '',
      tipo_servicio: '',
      direccion: '',
      telefono: '',
      email: '',
      horario_atencion: '',
      oculto: false
    };
  }

  formularioValido(): boolean {
    return !!(this.proveedorSeleccionado.nombre &&
      this.proveedorSeleccionado.tipo_servicio &&
      this.proveedorSeleccionado.direccion &&
      this.proveedorSeleccionado.telefono &&
      this.proveedorSeleccionado.email &&
      this.proveedorSeleccionado.horario_atencion);
  }

  obtenerNombreColumna(columna: string): string {
    const nombresColumnas: { [key: string]: string } = {
      'id_proveedor': 'ID',
      'nombre': 'Nombre',
      'tipo_servicio': 'Tipo de Servicio',
      'direccion': 'Dirección',
      'telefono': 'Teléfono',
      'email': 'Correo Electrónico',
      'horario_atencion': 'Horario de Atención'
    };
    return nombresColumnas[columna] || columna;
  }
}

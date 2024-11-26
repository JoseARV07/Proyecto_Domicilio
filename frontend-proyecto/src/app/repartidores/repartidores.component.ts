import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepartidorService } from '../services/repartidor.service';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx';

interface Repartidor {
  id_repartidor: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  tipo_vehiculo: string;
  estado_disponibilidad: boolean;
  [key: string]: string | number | boolean; // Añade esta línea
}

@Component({
  selector: 'app-repartidores',
  standalone: true,
  imports: [CommonModule, FormsModule, InputSwitchModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './repartidores.component.html',
  styleUrls: ['./repartidores.component.css']
})
export class RepartidoresComponent implements OnInit {
  repartidores: Repartidor[] = [];
  repartidoresFiltrados: Repartidor[] = [];
  mostrandoOcultos: boolean = false;
  mostrarModal: boolean = false;
  repartidorSeleccionado: Repartidor = this.nuevoRepartidor();
  cargando: boolean = true;
  searchTerm: string = '';
  columnasVisibles: string[] = ['id_repartidor', 'nombre', 'apellido', 'telefono', 'email', 'tipo_vehiculo', 'estado_disponibilidad'];
  columnaOrdenada: string = '';
  ordenAscendente: boolean = true;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalPaginas: number = 1;
  tiposVehiculo: string[] = [
    'Bicicleta',
    'Bicicleta eléctrica',
    'Motocicleta',
    'Scooter eléctrico',
    'Automóvil',
    'Furgoneta',
    'Camioneta',
    'A pie'
  ];

  constructor(
    private repartidorService: RepartidorService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cargarRepartidores();
  }

  cargarRepartidores() {
    this.cargando = true;
    this.repartidorService.getRepartidores(this.mostrandoOcultos).subscribe(
      (data: Repartidor[]) => {
        console.log('Datos recibidos:', data);
        this.repartidores = data;
        this.aplicarFiltrosYOrdenamiento();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar repartidores:', error);
        this.cargando = false;
      }
    );
  }

  onSearch() {
    this.aplicarFiltrosYOrdenamiento();
  }

  toggleOcultos() {
    this.mostrandoOcultos = !this.mostrandoOcultos;
    this.cargarRepartidores();
  }

  aplicarFiltrosYOrdenamiento() {
    let resultados = this.repartidores;

    if (this.searchTerm) {
      resultados = resultados.filter(repartidor =>
        Object.values(repartidor).some(value =>
          value && value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }

    if (this.columnaOrdenada) {
      resultados.sort((a, b) => {
        const valorA = a[this.columnaOrdenada as keyof Repartidor];
        const valorB = b[this.columnaOrdenada as keyof Repartidor];
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
    this.repartidoresFiltrados = resultados.slice(inicio, inicio + this.elementosPorPagina);
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

  exportarRepartidores() {
    const datosParaExportar = this.repartidores.map(repartidor => ({
      ID: repartidor.id_repartidor,
      Nombre: repartidor.nombre,
      Apellido: repartidor.apellido,
      Teléfono: repartidor.telefono,
      Email: repartidor.email,
      'Tipo de Vehículo': repartidor.tipo_vehiculo,
      Disponible: repartidor.estado_disponibilidad ? 'Sí' : 'No'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Repartidores');
    XLSX.writeFile(wb, 'repartidores.xlsx');
  }

  eliminarRepartidor(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este repartidor? Esta acción no se puede deshacer.',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptLabel: ' ',
      rejectLabel: ' ',
      acceptButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-success',
      rejectButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-danger',
      accept: () => {
        this.repartidorService.deleteRepartidor(id).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity: 'success', summary: 'Repartidor Eliminado', detail: 'El repartidor ha sido eliminado correctamente de la base de datos.'});
            this.cargarRepartidores();
          },
          (error) => {
            this.messageService.add({key: 'bc', severity: 'error', summary: 'Error de Eliminación', detail: 'Hubo un problema al eliminar el repartidor. Por favor, inténtelo de nuevo.'});
            console.error('Error al eliminar repartidor:', error);
          }
        );
      },
      reject: () => {
        this.messageService.add({key: 'bc', severity: 'info', summary: 'Eliminación Cancelada', detail: 'La eliminación del repartidor ha sido cancelada.'});
      }
    });
  }

  editarRepartidor(repartidor: Repartidor) {
    this.repartidorSeleccionado = { ...repartidor };
    this.mostrarModal = true;
  }

  abrirFormularioCreacion() {
    this.repartidorSeleccionado = this.nuevoRepartidor();
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.repartidorSeleccionado = this.nuevoRepartidor();
  }

  guardarRepartidor() {
    if (this.formularioValido()) {
      if (this.repartidorSeleccionado.id_repartidor) {
        // Actualizar repartidor existente
        this.repartidorService.updateRepartidor(this.repartidorSeleccionado).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity: 'success', summary: 'Repartidor Actualizado', detail: 'El repartidor se ha actualizado correctamente en la base de datos.'});
            this.cargarRepartidores();
            this.cerrarModal();
          },
          (error) => {
            this.messageService.add({key: 'bc', severity: 'error', summary: 'Error de Actualización', detail: 'Hubo un problema al actualizar el repartidor. Por favor, inténtelo de nuevo.'});
            console.error('Error al actualizar repartidor:', error);
          }
        );
      } else {
        // Crear nuevo repartidor
        this.repartidorService.createRepartidor(this.repartidorSeleccionado).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity: 'success', summary: 'Repartidor Creado', detail: 'El nuevo repartidor se ha creado correctamente en la base de datos.'});
            this.cargarRepartidores();
            this.cerrarModal();
          },
          (error) => {
            this.messageService.add({key: 'bc', severity: 'error', summary: 'Error de Creación', detail: 'Hubo un problema al crear el nuevo repartidor. Por favor, inténtelo de nuevo.'});
            console.error('Error al crear repartidor:', error);
          }
        );
      }
    } else {
      this.messageService.add({key: 'bc', severity: 'warn', summary: 'Formulario Incompleto', detail: 'Por favor, complete todos los campos requeridos antes de guardar.'});
    }
  }

  nuevoRepartidor(): Repartidor {
    return {
      id_repartidor: 0,
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      tipo_vehiculo: '',
      estado_disponibilidad: true
    };
  }

  formularioValido(): boolean {
    return !!(this.repartidorSeleccionado.nombre &&
      this.repartidorSeleccionado.apellido &&
      this.repartidorSeleccionado.telefono &&
      this.repartidorSeleccionado.email &&
      this.repartidorSeleccionado.tipo_vehiculo);
  }

  obtenerNombreColumna(columna: string): string {
    const nombresColumnas: { [key: string]: string } = {
      'id_repartidor': 'ID',
      'nombre': 'Nombre',
      'apellido': 'Apellido',
      'telefono': 'Teléfono',
      'email': 'Correo Electrónico',
      'tipo_vehiculo': 'Tipo de Vehículo',
      'estado_disponibilidad': 'Disponible'
    };
    return nombresColumnas[columna] || columna;
  }
}

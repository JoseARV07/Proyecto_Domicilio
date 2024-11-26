import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { PedidoService, Pedido } from '../services/pedido.service';
import { UsuarioService } from '../services/usuario.service';
import { ProveedorService } from '../services/proveedor.service';
import { RepartidorService } from '../services/repartidor.service';
import { DetallePedidoService } from '../services/detalle-pedido.service';
import { AppComponent } from '../app.component';
import * as XLSX from 'xlsx';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';

interface Usuario {
  id_usuario: number;
  nombre: string;
  direccion: string;
  // Añade aquí otras propiedades que puedas necesitar
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, InputSwitchModule, ButtonModule, ConfirmDialogModule, CalendarModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit, OnDestroy {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  pedidoSeleccionado: Pedido = this.inicializarPedido();
  usuarios: Usuario[] = [];
  proveedores: { id_proveedor: number, nombre: string }[] = [];
  repartidores: { id_repartidor: number, nombre: string }[] = [];
  mostrarModal: boolean = false;
  cargando: boolean = true;
  searchTerm: string = '';
  costosDomicilio: number[] = [2000, 3000, 4000, 5000];
  columnaOrdenada: string = '';
  ordenAscendente: boolean = true;
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;
  @ViewChild(ConfirmDialog) confirmDialog!: ConfirmDialog;
  columnasVisibles: string[] = [
    'id_pedido', 
    'id_usuario', 
    'id_proveedor', 
    'id_repartidor', 
    'fecha_hora_solicitud', 
    'fecha_hora_entrega', 
    'estado_pedido', 
    'direccion_entrega', 
    'total', 
    'metodo_pago', 
    'costo_domicilio'
  ];
  domiciliarios: any[] = [];
  private usuarioActualizadoSubscription: Subscription = new Subscription();
  private usuariosSubscription: Subscription = new Subscription();
  esEdicion: boolean = false;
  cerrandoModal: boolean = false;
  mostrarInputCostoDomicilio: boolean = false;

  constructor(
    private pedidoService: PedidoService,
    private usuarioService: UsuarioService,
    private proveedorService: ProveedorService,
    private repartidorService: RepartidorService,
    private detallePedidoService: DetallePedidoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private appComponent: AppComponent
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarProveedores();
    this.cargarRepartidores();
    this.cargarPedidos();
    this.cargarDomiciliarios();
    this.messageService.add({key: 'bc', severity:'success', summary: 'Success', detail: 'Message Content'});
    this.usuarioActualizadoSubscription.add(
      this.usuarioService.usuarioActualizado$.subscribe(
        (usuarioActualizado) => {
          this.actualizarUsuarioEnPedidos(usuarioActualizado);
        }
      )
    );
  }

  ngOnDestroy() {
    this.usuarioActualizadoSubscription.unsubscribe();
    this.usuariosSubscription.unsubscribe();
  }

  actualizarUsuarioEnPedidos(usuarioActualizado: Usuario) {
    console.log('Actualizando pedidos para usuario:', usuarioActualizado);
    this.pedidos = this.pedidos.map(pedido => {
      if (pedido.id_usuario === usuarioActualizado.id_usuario) {
        console.log('Actualizando pedido:', pedido.id_pedido);
        return {
          ...pedido,
          direccion_entrega: usuarioActualizado.direccion,
        };
      }
      return pedido;
    });
    this.pedidosFiltrados = this.pedidosFiltrados.map(pedido => {
      if (pedido.id_usuario === usuarioActualizado.id_usuario) {
        return {
          ...pedido,
          direccion_entrega: usuarioActualizado.direccion,
        };
      }
      return pedido;
    });
    this.aplicarFiltrosYOrdenamiento();
  }

  cargarPedidos() {
    this.cargando = true;
    this.pedidoService.getPedidos().subscribe(
      (data) => {
        this.pedidos = data;
        this.aplicarFiltrosYOrdenamiento();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar los pedidos:', error);
        this.appComponent.addMessage({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los pedidos'
        });
        this.cargando = false;
      }
    );
  }

  aplicarFiltrosYOrdenamiento() {
    let resultados = [...this.pedidos];

    if (this.searchTerm) {
      resultados = resultados.filter(pedido =>
        (pedido.id_pedido?.toString() || '').includes(this.searchTerm) ||
        this.obtenerNombreUsuario(pedido.id_usuario).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.obtenerNombreProveedor(pedido.id_proveedor).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (pedido.estado_pedido || '').toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.columnaOrdenada) {
      resultados.sort((a, b) => {
        let valorA: any = a[this.columnaOrdenada as keyof Pedido];
        let valorB: any = b[this.columnaOrdenada as keyof Pedido];

        if (this.columnaOrdenada === 'id_usuario') {
          valorA = this.obtenerNombreUsuario(a.id_usuario);
          valorB = this.obtenerNombreUsuario(b.id_usuario);
        } else if (this.columnaOrdenada === 'id_proveedor') {
          valorA = this.obtenerNombreProveedor(a.id_proveedor);
          valorB = this.obtenerNombreProveedor(b.id_proveedor);
        }

        // Manejar casos de null o undefined
        if (valorA === null || valorA === undefined) valorA = '';
        if (valorB === null || valorB === undefined) valorB = '';

        if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
        if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
        return 0;
      });
    }

    this.totalPaginas = Math.ceil(resultados.length / this.itemsPorPagina);
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.pedidosFiltrados = resultados.slice(inicio, fin);
  }

  onSearch() {
    this.aplicarFiltrosYOrdenamiento();
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

  eliminarPedido(id_pedido: number | undefined) {
    if (id_pedido === undefined) {
      console.error('ID de pedido no definido');
      return;
    }
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este pedido?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptLabel: ' ',
      rejectLabel: ' ',
      acceptButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-success',
      rejectButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-danger',
      accept: () => {
        this.pedidoService.deletePedido(id_pedido).subscribe(
          () => {
            this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Pedido eliminado correctamente', life: 3000});
            this.cargarPedidos();
          },
          (error) => {
            console.error('Error al eliminar el pedido:', error);
            this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudo eliminar el pedido', life: 3000});
          }
        );
      },
      reject: () => {
        this.messageService.add({severity:'info', summary: 'Cancelado', detail: 'Eliminación cancelada', life: 3000});
      }
    });
  }

  exportarExcel() {
    const datosExportar = this.pedidos.map(pedido => ({
      ID: pedido.id_pedido,
      Usuario: this.obtenerNombreUsuario(pedido.id_usuario),
      Proveedor: this.obtenerNombreProveedor(pedido.id_proveedor),
      Estado: pedido.estado_pedido,
      Total: pedido.total,
      'Costo Domicilio': this.formatearPrecio(pedido.costo_domicilio),
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
    XLSX.writeFile(wb, 'pedidos.xlsx');
  }

  formularioValido(): boolean {
    return !!(
      this.pedidoSeleccionado.id_usuario &&
      this.pedidoSeleccionado.id_proveedor &&
      this.pedidoSeleccionado.estado_pedido &&
      this.pedidoSeleccionado.direccion_entrega &&
      this.pedidoSeleccionado.costo_domicilio !== undefined &&
      this.pedidoSeleccionado.costo_domicilio !== null &&
      this.pedidoSeleccionado.id_repartidor !== undefined &&
      this.pedidoSeleccionado.id_repartidor !== null
    );
  }

  obtenerNombreUsuario(id_usuario: number): string {
    const usuario = this.usuarios.find(u => u.id_usuario === id_usuario);
    return usuario ? usuario.nombre : 'Usuario no encontrado';
  }

  obtenerNombreProveedor(id_proveedor: number): string {
    const proveedor = this.proveedores.find(p => p.id_proveedor === id_proveedor);
    return proveedor ? proveedor.nombre : 'Proveedor no encontrado';
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(
      (data) => {
        this.usuarios = data.map(usuario => ({
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          direccion: usuario.direccion
        }));
      },
      (error) => {
        console.error('Error al cargar usuarios:', error);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios'});
      }
    );
  }

  cargarProveedores() {
    this.proveedorService.getProveedores().subscribe(
      (data) => {
        this.proveedores = data;
      },
      (error) => {
        console.error('Error al cargar proveedores:', error);
        this.appComponent.addMessage({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los proveedores'
        });
      }
    );
  }

  cargarRepartidores() {
    this.repartidorService.getRepartidores().subscribe(
      (data) => {
        this.repartidores = data;
      },
      (error) => {
        console.error('Error al cargar repartidores:', error);
        this.appComponent.addMessage({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los repartidores'
        });
      }
    );
  }

  inicializarPedido(): Pedido {
    return {
      id_pedido: 0,
      id_usuario: 0,
      id_proveedor: 0,
      id_repartidor: null,
      fecha_hora_solicitud: new Date(),
      fecha_hora_entrega: null,
      estado_pedido: '',
      direccion_entrega: '',
      total: 0,
      metodo_pago: '',
      costo_domicilio: null
    };
  }

  abrirModal(pedido?: Pedido) {
    // Restaurar los costos de domicilio predefinidos
    this.costosDomicilio = [2000, 3000, 4000, 5000];

    if (pedido) {
      this.pedidoSeleccionado = { ...pedido };
      this.esEdicion = true;
      if (this.pedidoSeleccionado.costo_domicilio !== null && 
          !this.costosDomicilio.includes(this.pedidoSeleccionado.costo_domicilio)) {
        // Si el costo no es null y no está en la lista predefinida, agregarlo temporalmente
        this.costosDomicilio = [...this.costosDomicilio, this.pedidoSeleccionado.costo_domicilio];
      }
    } else {
      this.pedidoSeleccionado = this.inicializarPedido();
      this.esEdicion = false;
      // Asegurarse de que costo_domicilio sea null al crear un nuevo pedido
      this.pedidoSeleccionado.costo_domicilio = null;
    }
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.cerrandoModal = true;
    setTimeout(() => {
      this.mostrarModal = false;
      this.cerrandoModal = false;
      this.pedidoSeleccionado = this.inicializarPedido();
      // Restaurar los costos de domicilio predefinidos
      this.costosDomicilio = [2000, 3000, 4000, 5000];
    }, 90);
  }

  guardarPedido() {
    if (this.formularioValido()) {
      // Asegurarse de que la fecha de entrega esté establecida si el estado es 'entregado'
      if (this.pedidoSeleccionado.estado_pedido === 'entregado' && !this.pedidoSeleccionado.fecha_hora_entrega) {
        this.pedidoSeleccionado.fecha_hora_entrega = new Date();
      }

      if (this.pedidoSeleccionado.id_pedido) {
        this.pedidoService.updatePedido(this.pedidoSeleccionado).subscribe(
          () => {
            this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Pedido actualizado correctamente'});
            this.cargarPedidos();
            this.cerrarModal();
          },
          (error) => {
            console.error('Error al actualizar el pedido:', error);
            this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudo actualizar el pedido'});
          }
        );
      } else {
        this.pedidoService.createPedido(this.pedidoSeleccionado).subscribe(
          () => {
            this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Pedido creado correctamente'});
            this.cargarPedidos();
            this.cerrarModal();
          },
          (error) => {
            console.error('Error al crear el pedido:', error);
            this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudo crear el pedido'});
          }
        );
      }
    } else {
      this.messageService.add({severity:'warn', summary: 'Formulario incompleto', detail: 'Por favor, complete todos los campos requeridos'});
    }
  }

  rechazarConfirmacion() {
    this.confirmDialog.reject();
  }

  aceptarConfirmacion() {
    this.confirmDialog.accept();
  }

  obtenerNombreColumna(columna: string): string {
    const nombresColumnas: { [key: string]: string } = {
      'id_pedido': 'ID',
      'id_usuario': 'Usuario',
      'id_proveedor': 'Proveedor',
      'id_repartidor': 'Repartidor',
      'fecha_hora_solicitud': 'Fecha de Solicitud',
      'fecha_hora_entrega': 'Fecha de Entrega',
      'estado_pedido': 'Estado',
      'direccion_entrega': 'Dirección de Entrega',
      'total': 'Total',
      'metodo_pago': 'Método de Pago',
      'costo_domicilio': 'Costo de Domicilio'
    };
    return nombresColumnas[columna] || columna;
  }

  cargarDomiciliarios() {
    this.repartidorService.getRepartidores().subscribe(
      (data) => {
        this.domiciliarios = data;
      },
      (error) => {
        console.error('Error al cargar domiciliarios:', error);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudieron cargar los domiciliarios'});
      }
    );
  }

  obtenerNombreRepartidor(id_repartidor: number | null | undefined): string {
    if (id_repartidor === null || id_repartidor === undefined) return 'No asignado';
    const repartidor = this.domiciliarios.find(d => d.id_repartidor === id_repartidor);
    return repartidor ? repartidor.nombre : 'No encontrado';
  }

  onUsuarioSeleccionado() {
    console.log('Usuario seleccionado:', this.pedidoSeleccionado.id_usuario);
    const usuarioSeleccionado = this.usuarios.find(u => u.id_usuario === this.pedidoSeleccionado.id_usuario);
    console.log('Usuario encontrado:', usuarioSeleccionado);
    if (usuarioSeleccionado) {
      this.pedidoSeleccionado.direccion_entrega = usuarioSeleccionado.direccion;
      console.log('Dirección actualizada:', this.pedidoSeleccionado.direccion_entrega);
    }
  }

  formatearPrecio(precio: number | null | undefined): string {
    if (precio === null || precio === undefined) {
      return 'N/A';
    }
    const precioNumerico = typeof precio === 'string' ? parseFloat(precio) : precio;
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precioNumerico);
  }

  actualizarDireccionesEnPedidos() {
    this.pedidos = this.pedidos.map(pedido => {
      const usuario = this.usuarios.find(u => u.id_usuario === pedido.id_usuario);
      if (usuario) {
        return { ...pedido, direccion_entrega: usuario.direccion };
      }
      return pedido;
    });
    this.aplicarFiltrosYOrdenamiento();
  }

  onEstadoPedidoChange() {
    if (this.pedidoSeleccionado.estado_pedido === 'entregado') {
      this.pedidoSeleccionado.fecha_hora_entrega = new Date();
    } else {
      this.pedidoSeleccionado.fecha_hora_entrega = null;
    }
  }

  onCostoDomicilioChange(value: number | 'custom' | null): void {
    if (value === 'custom') {
      const costoPersonalizado = prompt('Ingrese el costo de domicilio personalizado:');
      if (costoPersonalizado !== null) {
        const costo = parseFloat(costoPersonalizado);
        if (!isNaN(costo) && costo >= 0) {
          this.pedidoSeleccionado.costo_domicilio = costo;
          if (!this.costosDomicilio.includes(costo)) {
            this.costosDomicilio = [...this.costosDomicilio, costo];
          }
        } else {
          alert('Por favor, ingrese un valor numérico válido.');
          this.pedidoSeleccionado.costo_domicilio = null;
        }
      } else {
        this.pedidoSeleccionado.costo_domicilio = null;
      }
    } else {
      this.pedidoSeleccionado.costo_domicilio = value;
    }
  }

  getPedidoProperty(pedido: Pedido, columna: string): string {
    if (columna in pedido) {
      return String((pedido as any)[columna]);
    }
    return 'N/A';
  }
}
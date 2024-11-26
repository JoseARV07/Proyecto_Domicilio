import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DetallePedidoService } from '../services/detalle-pedido.service';
import { Pedido, PedidoService } from '../services/pedido.service';
import { ProductoServicioService } from '../services/producto-servicio.service';
import { UsuarioService } from '../services/usuario.service';
import * as XLSX from 'xlsx';
import { ToastModule } from 'primeng/toast';

interface DetallePedido {
  id_detalle?: number;
  id_pedido: number;
  id_producto_servicio: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  nombre_pedido?: string;
  nombre_producto_servicio?: string;
  [key: string]: string | number | undefined;
}

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, InputSwitchModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detalles-pedido.component.html',
  styleUrls: ['./detalles-pedido.component.css']
})
export class DetallePedidoComponent implements OnInit {
  detallesPedido: DetallePedido[] = [];
  detallesPedidoFiltrados: DetallePedido[] = [];
  mostrarModal: boolean = false;
  detallePedidoSeleccionado: DetallePedido = this.nuevoDetallePedido();
  cargando: boolean = true;
  searchTerm: string = '';
  columnasVisibles: string[] = ['id_detalle', 'nombre_pedido', 'pedido_usuario', 'nombre_producto_servicio', 'cantidad', 'precio_unitario', 'subtotal'];
  columnaOrdenada: string = '';
  ordenAscendente: boolean = true;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalPaginas: number = 1;
  usuarios: { id_usuario: number, nombre: string }[] = [];
  cantidadesDisponibles: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  productosServicios: any[] = [];
  usuarioSeleccionado: number | null = null;
  pedidosDelUsuario: any[] = [];
  productosDelPedido: any[] = [];

  constructor(
    private detallePedidoService: DetallePedidoService,
    private pedidoService: PedidoService,
    private productoServicioService: ProductoServicioService,
    private usuarioService: UsuarioService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarPedidos();
    this.cargarProductosServicios();
    this.cargarDetallesPedido();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(
      (usuarios) => {
        this.usuarios = usuarios;
      },
      (error) => {
        console.error('Error al cargar usuarios:', error);
        this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios.'});
      }
    );
  }

  cargarPedidos() {
    this.pedidoService.getPedidos().subscribe(
      (pedidos) => {
        this.pedidosDelUsuario = pedidos.map(pedido => ({
          ...pedido,
          nombre_usuario: this.obtenerNombreUsuario(pedido.id_usuario)
        }));
      },
      (error) => {
        console.error('Error al cargar pedidos:', error);
        this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los pedidos.'});
      }
    );
  }

  cargarProductosServicios() {
    this.productoServicioService.getProductosServicios().subscribe(
      (productos) => {
        this.productosServicios = productos;
      },
      (error) => {
        console.error('Error al cargar productos/servicios:', error);
        this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos/servicios.'});
      }
    );
  }

  actualizarPrecioUnitario() {
    const productoSeleccionado = this.productosServicios.find(
      p => p.id_producto_servicio === this.detallePedidoSeleccionado.id_producto_servicio
    );
    if (productoSeleccionado) {
      this.detallePedidoSeleccionado.precio_unitario = productoSeleccionado.precio;
      this.calcularSubtotal();
    }
  }

  obtenerNombreUsuario(id_usuario: number): string {
    const usuario = this.usuarios.find(u => u.id_usuario === id_usuario);
    return usuario ? usuario.nombre : 'Usuario desconocido';
  }

  cargarDetallesPedido() {
    this.cargando = true;
    this.detallePedidoService.getDetallesPedido().subscribe(
      (data) => {
        this.detallesPedido = data;
        this.cargarNombres();
      },
      (error) => {
        console.error('Error al cargar detalles de pedido:', error);
        this.cargando = false;
      }
    );
  }

  cargarNombres() {
    const pedidosPromises = this.detallesPedido.map(detalle =>
      this.pedidoService.getPedido(detalle.id_pedido).toPromise()
    );

    const productosServiciosPromises = this.detallesPedido.map(detalle =>
      this.productoServicioService.getProductoServicio(detalle.id_producto_servicio).toPromise()
    );

    Promise.all([Promise.all(pedidosPromises), Promise.all(productosServiciosPromises)])
      .then(([pedidos, productosServicios]) => {
        this.detallesPedido.forEach((detalle, index) => {
          const pedido = pedidos[index] as Pedido;
          const productoServicio = productosServicios[index];
          
          const nombreUsuario = this.obtenerNombreUsuario(pedido.id_usuario);
          detalle.nombre_pedido = nombreUsuario; // Mantenemos el nombre del usuario aquí
          detalle['pedido_usuario'] = `Pedido de ${nombreUsuario}`; // Quitamos el ID del pedido
          
          detalle.nombre_producto_servicio = productoServicio?.nombre || `Producto/Servicio ${detalle.id_producto_servicio}`;
        });
        this.aplicarFiltrosYOrdenamiento();
        this.cargando = false;
      })
      .catch(error => {
        console.error('Error al cargar nombres:', error);
        this.cargando = false;
      });
  }

  onSearch() {
    this.aplicarFiltrosYOrdenamiento();
  }

  aplicarFiltrosYOrdenamiento() {
    let resultados = this.detallesPedido;

    if (this.searchTerm) {
      resultados = resultados.filter(detalle =>
        Object.values(detalle).some(value =>
          value && value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }

    if (this.columnaOrdenada) {
      resultados.sort((a, b) => {
        const valorA = a[this.columnaOrdenada as keyof DetallePedido];
        const valorB = b[this.columnaOrdenada as keyof DetallePedido];
        if (typeof valorA === 'string' && typeof valorB === 'string') {
          return this.ordenAscendente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        }
        if (valorA !== undefined && valorB !== undefined) {
          if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
          if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
        }
        return 0;
      });
    }

    this.totalPaginas = Math.ceil(resultados.length / this.elementosPorPagina);
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    this.detallesPedidoFiltrados = resultados.slice(inicio, inicio + this.elementosPorPagina);
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

  exportarDetallesPedido() {
    const datosParaExportar = this.detallesPedido.map(detalle => ({
      ID: detalle.id_detalle,
      'ID Pedido': detalle.id_pedido,
      'ID Producto/Servicio': detalle.id_producto_servicio,
      Cantidad: detalle.cantidad,
      'Precio Unitario': this.formatearPrecio(detalle.precio_unitario),
      Subtotal: this.formatearPrecio(detalle.subtotal)
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Detalles de Pedido');
    XLSX.writeFile(wb, 'detalles_pedido.xlsx');
  }

  eliminarDetallePedido(id: number | undefined) {
    if (id === undefined) {
      console.error('ID de detalle de pedido indefinido');
      return;
    }

    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar este detalle de pedido?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptLabel: ' ',
      rejectLabel: ' ',
      acceptButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-success',
      rejectButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-danger',
      accept: () => {
        this.detallePedidoService.deleteDetallePedido(id).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity:'success', summary: 'Éxito', detail: 'Detalle de pedido eliminado correctamente'});
            this.cargarDetallesPedido();
          },
          (error) => {
            console.error('Error al eliminar el detalle de pedido:', error);
            this.messageService.add({key: 'bc', severity:'error', summary: 'Error', detail: 'No se pudo eliminar el detalle de pedido'});
          }
        );
      },
      reject: () => {
        this.messageService.add({key: 'bc', severity:'info', summary: 'Cancelado', detail: 'No se eliminó el detalle de pedido'});
      }
    });
  }

  abrirFormularioCreacion() {
    this.detallePedidoSeleccionado = this.nuevoDetallePedido();
    this.usuarioSeleccionado = null; // Establecer a null para que se muestre "Seleccione un usuario"
    this.mostrarModal = true;
  }

  editarDetallePedido(detalle: DetallePedido) {
    if (detalle.id_detalle === undefined) {
      console.error('No se puede editar un detalle de pedido sin ID');
      this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: 'No se puede editar el detalle de pedido.'});
      return;
    }
    this.detallePedidoSeleccionado = { ...detalle };
    
    // Obtener el id_usuario del pedido
    this.pedidoService.getPedido(detalle.id_pedido).subscribe(
      (pedido: any) => {
        this.usuarioSeleccionado = pedido.id_usuario;
        this.mostrarModal = true;
      },
      (error) => {
        console.error('Error al obtener el pedido:', error);
        this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: 'No se pudo obtener la información del pedido.'});
      }
    );
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.detallePedidoSeleccionado = this.nuevoDetallePedido();
  }

  calcularSubtotal() {
    this.detallePedidoSeleccionado.subtotal = 
      this.detallePedidoSeleccionado.cantidad * this.detallePedidoSeleccionado.precio_unitario;
  }

  guardarDetallePedido() {
    if (this.formularioValido()) {
      this.calcularSubtotal();
      if (this.detallePedidoSeleccionado.id_detalle) {
        // Actualizar detalle de pedido existente
        this.detallePedidoService.updateDetallePedido(this.detallePedidoSeleccionado).subscribe(
          () => {
            this.actualizarTotalPedido(this.detallePedidoSeleccionado.id_pedido).then(() => {
              this.messageService.add({key: 'bc', severity: 'success', summary: 'Detalle de Pedido Actualizado', detail: 'El detalle de pedido se ha actualizado correctamente en la base de datos.'});
              this.cargarDetallesPedido();
              this.cerrarModal();
            }).catch((error) => {
              console.error('Error al actualizar el total del pedido:', error);
              this.messageService.add({key: 'bc', severity: 'warn', summary: 'Advertencia', detail: 'Se actualizó el detalle pero hubo un problema al actualizar el total del pedido.'});
              this.cargarDetallesPedido();
              this.cerrarModal();
            });
          },
          (error) => {
            this.messageService.add({key: 'bc', severity: 'error', summary: 'Error de Actualización', detail: 'Hubo un problema al actualizar el detalle de pedido. Por favor, inténtelo de nuevo.'});
            console.error('Error al actualizar detalle de pedido:', error);
          }
        );
      } else {
        // Crear nuevo detalle de pedido
        this.detallePedidoService.createDetallePedido(this.detallePedidoSeleccionado).subscribe(
          (nuevoDetalle) => {
            this.actualizarTotalPedido(this.detallePedidoSeleccionado.id_pedido).then(() => {
              this.messageService.add({key: 'bc', severity: 'success', summary: 'Detalle de Pedido Creado', detail: 'El nuevo detalle de pedido se ha creado correctamente en la base de datos.'});
              this.cargarDetallesPedido();
              this.cerrarModal();
            }).catch((error) => {
              console.error('Error al actualizar el total del pedido:', error);
              this.messageService.add({key: 'bc', severity: 'warn', summary: 'Advertencia', detail: 'Se creó el detalle pero hubo un problema al actualizar el total del pedido.'});
              this.cargarDetallesPedido();
              this.cerrarModal();
            });
          },
          (error) => {
            this.messageService.add({key: 'bc', severity: 'error', summary: 'Error de Creación', detail: 'Hubo un problema al crear el nuevo detalle de pedido. Por favor, inténtelo de nuevo.'});
            console.error('Error al crear detalle de pedido:', error);
          }
        );
      }
    } else {
      this.messageService.add({key: 'bc', severity: 'warn', summary: 'Formulario Incompleto', detail: 'Por favor, complete todos los campos requeridos antes de guardar.'});
    }
  }

  actualizarTotalPedido(idPedido: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pedidoService.getPedido(idPedido).subscribe(
        (pedido: any) => {
          if (pedido) {
            this.detallePedidoService.getDetallesPorPedido(idPedido).subscribe(
              (detalles: any[]) => {
                const subtotal = detalles.reduce((sum: number, detalle: any) => sum + detalle.subtotal, 0);
                const total = subtotal + (pedido.costo_domicilio || 0);
                this.pedidoService.updatePedido({ ...pedido, total: total }).subscribe(
                  () => {
                    console.log('Total del pedido actualizado');
                    resolve();
                  },
                  (error) => {
                    console.error('Error al actualizar el total del pedido:', error);
                    // Resolvemos la promesa en lugar de rechazarla para evitar que se detenga el proceso
                    resolve();
                  }
                );
              },
              (error) => {
                console.error('Error al obtener los detalles del pedido:', error);
                // Resolvemos la promesa en lugar de rechazarla
                resolve();
              }
            );
          } else {
            console.error('No se encontró información del pedido');
            // Resolvemos la promesa en lugar de rechazarla
            resolve();
          }
        },
        (error) => {
          console.error('Error al obtener el pedido:', error);
          // Resolvemos la promesa en lugar de rechazarla
          resolve();
        }
      );
    });
  }

  nuevoDetallePedido(): DetallePedido {
    return {
      id_detalle: undefined,
      id_pedido: 0,
      id_producto_servicio: 0,
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0
    };
  }

  formularioValido(): boolean {
    return !!(this.detallePedidoSeleccionado.id_pedido &&
            this.detallePedidoSeleccionado.id_producto_servicio &&
      this.detallePedidoSeleccionado.cantidad &&
      this.detallePedidoSeleccionado.precio_unitario);
  }

  obtenerNombreColumna(columna: string): string {
    const nombresColumnas: { [key: string]: string } = {
      'id_detalle': 'ID',
      'nombre_pedido': 'ID Usuario',
      'pedido_usuario': 'Pedido del Usuario',
      'nombre_producto_servicio': 'Producto/Servicio',
      'cantidad': 'Cantidad',
      'precio_unitario': 'Precio Unitario',
      'subtotal': 'Subtotal'
    };
    return nombresColumnas[columna] || columna;
  }

  inicializarDetallePedido(): DetallePedido {
    return {
      id_detalle: undefined,
      id_pedido: 0,
      id_producto_servicio: 0,
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0
    };
  }

  formatearPrecio(precio: number | string): string {
    const precioNumerico = typeof precio === 'string' ? parseFloat(precio) : precio;
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precioNumerico);
  }
}
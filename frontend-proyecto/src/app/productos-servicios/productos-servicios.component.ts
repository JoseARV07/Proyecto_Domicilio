import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { ProductoServicioService, ProductoServicio } from '../services/producto-servicio.service';
import { ProveedorService } from '../services/proveedor.service';
import * as XLSX from 'xlsx';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-productos-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, InputSwitchModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './productos-servicios.component.html',
  styleUrls: ['./productos-servicios.component.css']
})
export class ProductosServiciosComponent implements OnInit {
  productosServicios: ProductoServicio[] = [];
  productoServiciosFiltrados: ProductoServicio[] = [];
  productoServicioSeleccionado: ProductoServicio = this.inicializarProductoServicio();
  proveedores: { id_proveedor: number, nombre: string }[] = [];
  mostrarModal: boolean = false;
  cargando: boolean = true;
  searchTerm: string = '';
  columnaOrdenada: string = '';
  ordenAscendente: boolean = true;
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;
  @ViewChild(ConfirmDialog) confirmDialog!: ConfirmDialog;
  columnasVisibles: string[] = ['id_producto_servicio', 'id_proveedor', 'nombre', 'precio', 'categoria', 'disponibilidad'];
  mostrandoNoDisponibles: boolean = false;

  constructor(
    private productoServicioService: ProductoServicioService,
    private proveedorService: ProveedorService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarProveedores();
    this.cargarProductosServicios();
  }

  cargarProveedores() {
    this.proveedorService.getProveedores().subscribe(
      (data) => {
        this.proveedores = data;
      },
      (error) => {
        console.error('Error al cargar proveedores:', error);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudieron cargar los proveedores'});
      }
    );
  }

  cargarProductosServicios() {
    this.cargando = true;
    this.productoServicioService.getProductosServicios().subscribe(
      (data) => {
        this.productosServicios = data;
        this.aplicarFiltrosYOrdenamiento();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar productos/servicios:', error);
        this.cargando = false;
        this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudieron cargar los productos/servicios'});
      }
    );
  }

  aplicarFiltrosYOrdenamiento() {
    let resultados = [...this.productosServicios];

    if (this.searchTerm) {
      resultados = resultados.filter(productoServicio =>
        Object.values(productoServicio).some(value =>
          value && value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }

    if (this.columnaOrdenada) {
      resultados.sort((a, b) => {
        const valorA = a[this.columnaOrdenada as keyof ProductoServicio];
        const valorB = b[this.columnaOrdenada as keyof ProductoServicio];
        if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
        if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
        return 0;
      });
    }

    if (!this.mostrandoNoDisponibles) {
      resultados = resultados.filter(ps => ps.disponibilidad);
    }

    this.totalPaginas = Math.ceil(resultados.length / this.itemsPorPagina);
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.productoServiciosFiltrados = resultados.slice(inicio, fin);
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

  inicializarProductoServicio(): ProductoServicio {
    return {
      id_producto_servicio: 0,
      id_proveedor: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      disponibilidad: true
    } as ProductoServicio;
  }

  abrirModal(productoServicio?: ProductoServicio) {
    if (productoServicio) {
      this.productoServicioSeleccionado = { ...productoServicio };
    } else {
      this.productoServicioSeleccionado = this.inicializarProductoServicio();
    }
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.productoServicioSeleccionado = this.inicializarProductoServicio();
  }

  guardarProductoServicio() {
    if (this.formularioValido()) {
      // Asegúrate de que el precio sea un número antes de guardar
      this.productoServicioSeleccionado.precio = this.parsearPrecio(this.productoServicioSeleccionado.precio.toString());
      
      if (this.productoServicioSeleccionado.id_producto_servicio) {
        this.productoServicioService.updateProductoServicio(this.productoServicioSeleccionado as ProductoServicio).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity:'success', summary: 'Éxito', detail: 'Producto/servicio actualizado correctamente'});
            this.cargarProductosServicios();
            this.cerrarModal();
          },
          (error) => {
            console.error('Error al actualizar el producto/servicio:', error);
            this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudo actualizar el producto/servicio'});
          }
        );
      } else {
        const nuevoProductoServicio: Omit<ProductoServicio, 'id_producto_servicio'> = {
          id_proveedor: this.productoServicioSeleccionado.id_proveedor,
          nombre: this.productoServicioSeleccionado.nombre,
          descripcion: this.productoServicioSeleccionado.descripcion,
          precio: this.productoServicioSeleccionado.precio,
          categoria: this.productoServicioSeleccionado.categoria,
          disponibilidad: this.productoServicioSeleccionado.disponibilidad
        };
        this.productoServicioService.createProductoServicio(nuevoProductoServicio).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity:'success', summary: 'Éxito', detail: 'Producto/servicio creado correctamente'});
            this.cargarProductosServicios();
            this.cerrarModal();
          },
          (error) => {
            console.error('Error al crear el producto/servicio:', error);
            this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudo crear el producto/servicio'});
          }
        );
      }
    } else {
      this.messageService.add({severity:'warn', summary: 'Formulario incompleto', detail: 'Por favor, complete todos los campos requeridos'});
    }
  }

  eliminarProductoServicio(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este producto/servicio?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptLabel: ' ',
      rejectLabel: ' ',
      acceptButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-success',
      rejectButtonStyleClass: 'p-button-rounded p-button-text p-button-plain custom-confirm-button p-button-danger',
      accept: () => {
        this.productoServicioService.deleteProductoServicio(id).subscribe(
          () => {
            this.messageService.add({key: 'bc', severity:'success', summary: 'Éxito', detail: 'Producto/servicio eliminado correctamente'});
            this.cargarProductosServicios();
          },
          (error) => {
            console.error('Error al eliminar el producto/servicio:', error);
            this.messageService.add({severity:'error', summary: 'Error', detail: 'No se pudo eliminar el producto/servicio'});
          }
        );
      },
      reject: () => {
        this.messageService.add({severity:'info', summary: 'Cancelado', detail: 'Eliminación cancelada'});
      }
    });
  }

  formularioValido(): boolean {
    return !!(
      this.productoServicioSeleccionado.id_proveedor &&
      this.productoServicioSeleccionado.nombre &&
      this.productoServicioSeleccionado.precio &&
      this.productoServicioSeleccionado.categoria
    );
  }

  obtenerNombreProveedor(id_proveedor: number): string {
    const proveedor = this.proveedores.find(p => p.id_proveedor === id_proveedor);
    return proveedor ? proveedor.nombre : 'Proveedor no encontrado';
  }

  obtenerNombreColumna(columna: string): string {
    const nombresColumnas: { [key: string]: string } = {
      'id_producto_servicio': 'ID',
      'id_proveedor': 'Proveedor',
      'nombre': 'Nombre',
      'precio': 'Precio',
      'categoria': 'Categoría',
      'disponibilidad': 'Disponible'
    };
    return nombresColumnas[columna] || columna;
  }

  exportarExcel() {
    const datosExportar = this.productosServicios.map(ps => ({
      ID: ps.id_producto_servicio,
      Proveedor: this.obtenerNombreProveedor(ps.id_proveedor),
      Nombre: ps.nombre,
      Precio: this.formatearPrecio(ps.precio),
      Categoría: ps.categoria,
      Disponible: ps.disponibilidad ? 'Sí' : 'No'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos y Servicios');
    XLSX.writeFile(wb, 'productos_servicios.xlsx');
  }

  toggleNoDisponibles() {
    this.mostrandoNoDisponibles = !this.mostrandoNoDisponibles;
    this.aplicarFiltrosYOrdenamiento();
  }

  abrirFormularioCreacion() {
    this.abrirModal();
  }

  exportarProductosServicios() {
    this.exportarExcel();
  }

  editarProductoServicio(productoServicio: ProductoServicio) {
    this.abrirModal(productoServicio);
  }

  formatearPrecio(precio: number | string): string {
    if (typeof precio === 'string') {
      precio = this.parsearPrecio(precio);
    }
    if (isNaN(precio)) {
      return '';
    }
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(precio);
  }

  parsearPrecio(precio: string): number {
    // Elimina todos los caracteres no numéricos excepto el punto decimal
    const precioLimpio = precio.replace(/[^\d.]/g, '');
    return parseFloat(precioLimpio);
  }

  onPrecioInput(event: any) {
    let valor = event.target.value;
    // Elimina todos los caracteres no numéricos
    valor = valor.replace(/[^\d]/g, '');
    // Convierte a número y formatea
    const precioNumerico = parseInt(valor, 10);
    this.productoServicioSeleccionado.precio = isNaN(precioNumerico) ? 0 : precioNumerico;
    // Actualiza el valor del input con el precio formateado
    event.target.value = this.formatearPrecio(this.productoServicioSeleccionado.precio);
  }
}

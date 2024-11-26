import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [MenuModule, SidebarModule],
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.css']
})
export class AsideComponent implements OnInit {
  items!: MenuItem[];
  visibleSidebar: boolean = false;

  ngOnInit() {
    this.items = [
      {label: 'Usuarios', icon: 'pi pi-fw pi-user', routerLink: ['/usuarios']},
      {label: 'Proveedores', icon: 'pi pi-fw pi-briefcase', routerLink: ['/proveedores']},
      {label: 'Productos/Servicios', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/productos-servicios']},
      {label: 'Pedidos', icon: 'pi pi-fw pi-list', routerLink: ['/pedidos']},
      {label: 'Detalles de Pedido', icon: 'pi pi-fw pi-info-circle', routerLink: ['/detalles-pedido']},
      {label: 'Repartidores', icon: 'pi pi-fw pi-car', routerLink: ['/repartidores']}
    ];
  }

  toggleSidebar() {
    this.visibleSidebar = !this.visibleSidebar;
  }
}

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { ProductosServiciosComponent } from './productos-servicios/productos-servicios.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { DetallePedidoComponent } from './detalles-pedido/detalles-pedido.component';
import { RepartidoresComponent } from './repartidores/repartidores.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'usuarios', 
    component: UsuariosComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'proveedores', 
    component: ProveedoresComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'productos-servicios', 
    component: ProductosServiciosComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'pedidos', 
    component: PedidosComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'detalles-pedido', 
    component: DetallePedidoComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'repartidores', 
    component: RepartidoresComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

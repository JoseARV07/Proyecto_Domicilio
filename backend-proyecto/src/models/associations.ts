import Usuario from './usuario';
import Proveedor from './proveedor';
import ProductoServicio from './productoServicio';
import Pedido from './pedido';
import DetallePedido from './detallePedido';
import Repartidor from './repartidor';

export function setupAssociations() {
  // Relaciones de Usuario
  Usuario.hasMany(Pedido, { foreignKey: 'id_usuario' });
  Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario' });

  // Relaciones de Proveedor
  Proveedor.hasMany(ProductoServicio, { foreignKey: 'id_proveedor' });
  ProductoServicio.belongsTo(Proveedor, { foreignKey: 'id_proveedor' });

  Proveedor.hasMany(Pedido, { foreignKey: 'id_proveedor' });
  Pedido.belongsTo(Proveedor, { foreignKey: 'id_proveedor' });

  // Relaciones de Pedido
  Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido' });
  DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });

  // Relaciones de ProductoServicio
  ProductoServicio.hasMany(DetallePedido, { foreignKey: 'id_producto_servicio' });
  DetallePedido.belongsTo(ProductoServicio, { foreignKey: 'id_producto_servicio' });

  // Relaciones de Repartidor
  Repartidor.hasMany(Pedido, { foreignKey: 'id_repartidor' });
  Pedido.belongsTo(Repartidor, { foreignKey: 'id_repartidor' });
}

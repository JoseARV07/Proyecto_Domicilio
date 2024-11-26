import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class DetallePedido extends Model {
  public id_detalle!: number;
  public id_pedido!: number;
  public id_producto_servicio!: number;
  public cantidad!: number;
  public precio_unitario!: number;
  public subtotal!: number;
}

DetallePedido.init({
  id_detalle: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  id_pedido: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  id_producto_servicio: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'detalles_pedido',
});

export default DetallePedido;

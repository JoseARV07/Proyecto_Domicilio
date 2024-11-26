import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Pedido extends Model {
  public id_pedido!: number;
  public id_usuario!: number;
  public id_proveedor!: number;
  public id_repartidor!: number | null;
  public fecha_hora_solicitud!: Date;
  public fecha_hora_entrega!: Date;
  public estado_pedido!: string;
  public direccion_entrega!: string;
  public total!: number;
  public metodo_pago!: string;
  public costo_domicilio!: number;
}

Pedido.init({
  id_pedido: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  id_proveedor: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  id_repartidor: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  fecha_hora_solicitud: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  fecha_hora_entrega: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estado_pedido: {
    type: DataTypes.ENUM('pendiente', 'en_proceso', 'entregado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  direccion_entrega: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  metodo_pago: {
    type: DataTypes.ENUM(
      'efectivo',
      'tarjeta_credito',
      'tarjeta_debito',
      'transferencia_bancaria',
      'paypal',
      'nequi',
      'daviplata',
      'pse',
      'bitcoin',
      'otro'
    ),
    allowNull: false,
  },
  costo_domicilio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'pedidos',
});

export default Pedido;

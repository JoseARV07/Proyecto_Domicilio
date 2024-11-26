import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ProductoServicio extends Model {
  public id_producto_servicio!: number;
  public id_proveedor!: number;
  public nombre!: string;
  public descripcion!: string;
  public precio!: number;
  public categoria!: string;
  public disponibilidad!: boolean;
}

ProductoServicio.init({
  id_producto_servicio: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  id_proveedor: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  disponibilidad: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  tableName: 'productos_servicios',
});

export default ProductoServicio;

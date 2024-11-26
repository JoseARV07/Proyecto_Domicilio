import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Proveedor extends Model {
  public id_proveedor!: number;
  public nombre!: string;
  public tipo_servicio!: string;
  public direccion!: string;
  public telefono!: string;
  public email!: string;
  public horario_atencion!: string;
  public oculto!: boolean;
}

Proveedor.init({
  id_proveedor: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo_servicio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  horario_atencion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  oculto: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  sequelize,
  tableName: 'proveedores',
});

export default Proveedor;

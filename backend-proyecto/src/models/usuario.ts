import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Pedido from './pedido';

class Usuario extends Model {
  public id_usuario!: number;
  public nombre!: string;
  public apellido!: string;
  public email!: string;
  public telefono!: string;
  public direccion!: string;
  public fecha_registro!: Date;
  public oculto!: boolean;
}

Usuario.init({
  id_usuario: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  oculto: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  sequelize,
  tableName: 'usuarios',
});

Usuario.hasMany(Pedido, { foreignKey: 'id_usuario' });

export default Usuario;

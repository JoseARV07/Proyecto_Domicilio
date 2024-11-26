import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Repartidor extends Model {
  public id_repartidor!: number;
  public nombre!: string;
  public apellido!: string;
  public telefono!: string;
  public email!: string;
  public tipo_vehiculo!: string;
  public estado_disponibilidad!: string;
  public oculto!: boolean;
}

Repartidor.init({
  id_repartidor: {
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
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tipo_vehiculo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado_disponibilidad: {
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
  tableName: 'repartidores',
});

export default Repartidor;

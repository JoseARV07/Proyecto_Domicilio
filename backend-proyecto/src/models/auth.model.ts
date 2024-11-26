import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Auth extends Model {
  public id_auth!: number;
  public email!: string;
  public password!: string;
}

Auth.init({
  id_auth: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: 'auth',
});

export default Auth;
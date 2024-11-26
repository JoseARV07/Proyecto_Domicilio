import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('Domicilios', 'root', '12345678', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306, // Puerto por defecto de MySQL
  logging: true, // Establece en true si quieres ver las consultas SQL en la consola
});

export default sequelize;

// Función para probar la conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};


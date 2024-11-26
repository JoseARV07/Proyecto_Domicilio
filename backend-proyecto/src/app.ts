import express from 'express';
import cors from 'cors'; // Importa el paquete cors
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes';
import sequelize, { testConnection } from './config/database';
import { setupAssociations } from './models/associations';

// Importar las rutas
import usuarioRoutes from './routes/usuarioRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import productoServicioRoutes from './routes/productoServicioRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import detallePedidoRoutes from './routes/detallePedidoRoutes';
import repartidorRoutes from './routes/repartidorRoutes';

const app = express();
const port = 3000;

// Configurar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: ['http://127.0.0.1:4200', 'http://localhost:4200']
}));

app.use(express.json());

// Configurar asociaciones
setupAssociations();

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Sincronizar los modelos con la base de datos
sequelize.sync({ force: false }).then(() => {
  console.log('Base de datos sincronizada');
}).catch((error) => {
  console.error('Error al sincronizar la base de datos:', error);
});

// Probar la conexión a la base de datos
testConnection();

// Usar las rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/productos-servicios', productoServicioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/detalles-pedido', detallePedidoRoutes);
app.use('/api/repartidores', repartidorRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

import express from 'express';
import {
  crearRepartidor,
  obtenerRepartidores,
  obtenerRepartidor,
  actualizarRepartidor,
  eliminarRepartidor,
  ocultarRepartidor
} from '../controllers/repartidorController';

const router = express.Router();

router.post('/', crearRepartidor);
router.get('/', obtenerRepartidores);
router.get('/:id', obtenerRepartidor);
router.put('/:id', actualizarRepartidor);
router.delete('/:id', eliminarRepartidor);
router.patch('/:id/ocultar', ocultarRepartidor);

export default router;


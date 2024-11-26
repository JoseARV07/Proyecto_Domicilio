import express from 'express';
import {
  crearPedido,
  obtenerPedidos,
  obtenerPedido,
  actualizarPedido,
  eliminarPedido
} from '../controllers/pedidoController';

const router = express.Router();

router.post('/', crearPedido);
router.get('/', obtenerPedidos);
router.get('/:id', obtenerPedido);
router.put('/:id', actualizarPedido);
router.delete('/:id', eliminarPedido);

export default router;

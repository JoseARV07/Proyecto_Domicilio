import express from 'express';
import {
  crearProductoServicio,
  obtenerProductosServicios,
  obtenerProductoServicio,
  actualizarProductoServicio,
  eliminarProductoServicio,
  cambiarDisponibilidadProductoServicio
} from '../controllers/productoServicioController';

const router = express.Router();

router.post('/', crearProductoServicio);
router.get('/', obtenerProductosServicios);
router.get('/:id', obtenerProductoServicio);
router.put('/:id', actualizarProductoServicio);
router.delete('/:id', eliminarProductoServicio);
router.patch('/:id/disponibilidad', cambiarDisponibilidadProductoServicio);

export default router;

import express from 'express';
import {
  crearProveedor,
  obtenerProveedores,
  obtenerProveedor,
  actualizarProveedor,
  eliminarProveedor,
  ocultarProveedor
} from '../controllers/proveedorController';

const router = express.Router();

router.post('/', crearProveedor);
router.get('/', obtenerProveedores);
router.get('/:id', obtenerProveedor);
router.put('/:id', actualizarProveedor);
router.delete('/:id', eliminarProveedor);
router.patch('/:id/ocultar', ocultarProveedor);

export default router;


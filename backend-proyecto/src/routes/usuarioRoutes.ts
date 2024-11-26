import express from 'express';
import {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  ocultarUsuario
} from '../controllers/usuarioController';

const router = express.Router();

router.post('/', crearUsuario);
router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);
router.patch('/:id/ocultar', ocultarUsuario);

export default router;


import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { verifyToken, isPublic } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas
router.post('/register', isPublic, register);
router.post('/login', isPublic, login);

// Ruta protegida de ejemplo
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'Ruta protegida accedida exitosamente' });
});

export default router;
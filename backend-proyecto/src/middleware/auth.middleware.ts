import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(403).json({ 
        message: 'No se proporcionó token de acceso' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Token inválido o expirado' 
    });
  }
};

// Middleware para rutas públicas (opcional)
export const isPublic = (req: Request, res: Response, next: NextFunction) => {
  next();
};
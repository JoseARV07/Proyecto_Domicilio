// src/app/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Auth from '../models/auth.model';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoAuth = await Auth.create({
      email,
      password: hashedPassword
    });
    
    // No enviamos el password en la respuesta
    const { password: _, ...authData } = nuevoAuth.toJSON();
    res.status(201).json(authData);
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar el usuario' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const auth = await Auth.findOne({ where: { email } });
    if (!auth) return res.status(400).json({ error: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id_auth: auth.id_auth }, 'tu_secreto', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
};
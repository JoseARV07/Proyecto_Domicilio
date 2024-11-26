import { Request, Response } from 'express';
import Proveedor from '../models/proveedor';

export const crearProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.create(req.body);
    res.status(201).json(proveedor);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear proveedor', error });
  }
};

export const obtenerProveedores = async (req: Request, res: Response) => {
  try {
    const proveedores = await Proveedor.findAll({ where: { oculto: false } });
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proveedores', error });
  }
};

export const obtenerProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (proveedor && !proveedor.getDataValue('oculto')) {
      res.json(proveedor);
    } else {
      res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proveedor', error });
  }
};

export const actualizarProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (proveedor && !proveedor.getDataValue('oculto')) {
      await proveedor.update(req.body);
      res.json(proveedor);
    } else {
      res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar proveedor', error });
  }
};

export const eliminarProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (proveedor) {
      await proveedor.destroy();
      res.json({ mensaje: 'Proveedor eliminado' });
    } else {
      res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar proveedor', error });
  }
};

export const ocultarProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (proveedor) {
      await proveedor.update({ oculto: true });
      res.json({ mensaje: 'Proveedor ocultado' });
    } else {
      res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al ocultar proveedor', error });
  }
};


import { Request, Response } from 'express';
import ProductoServicio from '../models/productoServicio';

export const crearProductoServicio = async (req: Request, res: Response) => {
  try {
    const productoServicio = await ProductoServicio.create(req.body);
    res.status(201).json(productoServicio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear producto/servicio', error });
  }
};

export const obtenerProductosServicios = async (req: Request, res: Response) => {
  try {
    const soloDisponibles = req.query.soloDisponibles === 'true';
    const whereClause = soloDisponibles ? { disponibilidad: true } : {};
    
    const productosServicios = await ProductoServicio.findAll({ where: whereClause });
    res.json(productosServicios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos/servicios', error });
  }
};

export const obtenerProductoServicio = async (req: Request, res: Response) => {
  try {
    const productoServicio = await ProductoServicio.findByPk(req.params.id);
    if (productoServicio) {
      res.json(productoServicio);
    } else {
      res.status(404).json({ mensaje: 'Producto/servicio no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener producto/servicio', error });
  }
};

export const actualizarProductoServicio = async (req: Request, res: Response) => {
  try {
    const productoServicio = await ProductoServicio.findByPk(req.params.id);
    if (productoServicio) {
      await productoServicio.update(req.body);
      res.json(productoServicio);
    } else {
      res.status(404).json({ mensaje: 'Producto/servicio no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar producto/servicio', error });
  }
};

export const eliminarProductoServicio = async (req: Request, res: Response) => {
  try {
    const productoServicio = await ProductoServicio.findByPk(req.params.id);
    if (productoServicio) {
      await productoServicio.destroy();
      res.json({ mensaje: 'Producto/servicio eliminado' });
    } else {
      res.status(404).json({ mensaje: 'Producto/servicio no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto/servicio', error });
  }
};

export const cambiarDisponibilidadProductoServicio = async (req: Request, res: Response) => {
  try {
    const productoServicio = await ProductoServicio.findByPk(req.params.id);
    if (productoServicio) {
      await productoServicio.update({ disponibilidad: req.body.disponibilidad });
      res.json({ mensaje: 'Disponibilidad de producto/servicio actualizada', productoServicio });
    } else {
      res.status(404).json({ mensaje: 'Producto/servicio no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar disponibilidad de producto/servicio', error });
  }
};

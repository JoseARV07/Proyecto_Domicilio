import { Request, Response } from 'express';
import Repartidor from '../models/repartidor';

export const crearRepartidor = async (req: Request, res: Response) => {
  try {
    const repartidor = await Repartidor.create(req.body);
    res.status(201).json(repartidor);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear repartidor', error });
  }
};

export const obtenerRepartidores = async (req: Request, res: Response) => {
  try {
    const incluirOcultos = req.query.incluirOcultos === 'true';
    const whereClause = incluirOcultos ? {} : { oculto: false };
    
    const repartidores = await Repartidor.findAll({ where: whereClause });
    res.json(repartidores);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener repartidores', error });
  }
};

export const obtenerRepartidor = async (req: Request, res: Response) => {
  try {
    const repartidor = await Repartidor.findByPk(req.params.id);
    if (repartidor && !repartidor.getDataValue('oculto')) {
      res.json(repartidor);
    } else {
      res.status(404).json({ mensaje: 'Repartidor no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener repartidor', error });
  }
};

export const actualizarRepartidor = async (req: Request, res: Response) => {
  try {
    const repartidor = await Repartidor.findByPk(req.params.id);
    if (repartidor && !repartidor.getDataValue('oculto')) {
      await repartidor.update(req.body);
      res.json(repartidor);
    } else {
      res.status(404).json({ mensaje: 'Repartidor no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar repartidor', error });
  }
};

export const eliminarRepartidor = async (req: Request, res: Response) => {
  try {
    const repartidor = await Repartidor.findByPk(req.params.id);
    if (repartidor) {
      await repartidor.destroy();
      res.json({ mensaje: 'Repartidor eliminado' });
    } else {
      res.status(404).json({ mensaje: 'Repartidor no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar repartidor', error });
  }
};

export const ocultarRepartidor = async (req: Request, res: Response) => {
  try {
    const repartidor = await Repartidor.findByPk(req.params.id);
    if (repartidor) {
      await repartidor.update({ oculto: true });
      res.json({ mensaje: 'Repartidor ocultado' });
    } else {
      res.status(404).json({ mensaje: 'Repartidor no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al ocultar repartidor', error });
  }
};


import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import Pedido from '../models/pedido';
import DetallePedido from '../models/detallePedido';
import sequelize from '../config/database';

export const crearPedido = async (req: Request, res: Response) => {
  let transaction: Transaction | undefined;
  try {
    transaction = await sequelize.transaction();

    const pedido = await Pedido.create(req.body, { transaction });
    
    // Si hay detalles de pedido, los creamos y calculamos el total
    if (req.body.detalles && Array.isArray(req.body.detalles)) {
      for (const detalle of req.body.detalles) {
        await DetallePedido.create({
          ...detalle,
          id_pedido: pedido.id_pedido
        }, { transaction });
      }
      
      await recalcularTotalPedido(pedido.id_pedido, transaction);
    }

    await transaction.commit();
    
    // Obtenemos el pedido actualizado con el total calculado
    const pedidoActualizado = await Pedido.findByPk(pedido.id_pedido, {
      include: [{ model: DetallePedido }]
    });
    
    res.status(201).json(pedidoActualizado);
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ mensaje: 'Error al crear pedido', error });
  }
};

export const obtenerPedidos = async (req: Request, res: Response) => {
  try {
    const pedidos = await Pedido.findAll();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error });
  }
};

export const obtenerPedido = async (req: Request, res: Response) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (pedido) {
      res.json(pedido);
    } else {
      res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pedido', error });
  }
};

export const actualizarPedido = async (req: Request, res: Response) => {
  let transaction: Transaction | undefined;
  try {
    transaction = await sequelize.transaction();

    const pedido = await Pedido.findByPk(req.params.id);
    if (pedido) {
      await pedido.update(req.body, { transaction });
      await recalcularTotalPedido(pedido.id_pedido, transaction);
      
      await transaction.commit();
      
      const pedidoActualizado = await Pedido.findByPk(pedido.id_pedido, {
        include: [{ model: DetallePedido }]
      });
      
      res.json(pedidoActualizado);
    } else {
      await transaction.rollback();
      res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ mensaje: 'Error al actualizar pedido', error });
  }
};

export const eliminarPedido = async (req: Request, res: Response) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (pedido) {
      await pedido.destroy();
      res.json({ mensaje: 'Pedido eliminado' });
    } else {
      res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar pedido', error });
  }
};

// Función auxiliar para recalcular el total del pedido
async function recalcularTotalPedido(idPedido: number, transaction?: Transaction) {
  const detalles = await DetallePedido.findAll({
    where: { id_pedido: idPedido },
    transaction
  });
  
  const subtotal = detalles.reduce((sum, detalle) => sum + Number(detalle.subtotal), 0);
  
  const pedido = await Pedido.findByPk(idPedido, { transaction });
  if (pedido) {
    const total = subtotal + Number(pedido.costo_domicilio);
    await pedido.update({ total }, { transaction });
  }
}

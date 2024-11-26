import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import DetallePedido from '../models/detallePedido';
import Pedido from '../models/pedido';
import sequelize from '../config/database';

export const crearDetallePedido = async (req: Request, res: Response) => {
  let transaction: Transaction | undefined;
  try {
    transaction = await sequelize.transaction();

    const detallePedido = await DetallePedido.create(req.body, { transaction });
    
    // Recalcular el total del pedido
    await recalcularTotalPedido(detallePedido.id_pedido, transaction);

    await transaction.commit();
    
    // Obtener el pedido actualizado con todos sus detalles
    const pedidoActualizado = await Pedido.findByPk(detallePedido.id_pedido, {
      include: [{ model: DetallePedido }]
    });
    
    res.status(201).json({ detallePedido, pedidoActualizado });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ mensaje: 'Error al crear detalle de pedido', error });
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

export const obtenerDetallesPedido = async (req: Request, res: Response) => {
  try {
    const detallesPedido = await DetallePedido.findAll();
    res.json(detallesPedido);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener detalles de pedido', error });
  }
};

export const obtenerDetallePedido = async (req: Request, res: Response) => {
  try {
    const detallePedido = await DetallePedido.findByPk(req.params.id);
    if (detallePedido) {
      res.json(detallePedido);
    } else {
      res.status(404).json({ mensaje: 'Detalle de pedido no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener detalle de pedido', error });
  }
};

export const actualizarDetallePedido = async (req: Request, res: Response) => {
  let transaction: Transaction | undefined;
  try {
    transaction = await sequelize.transaction();

    const detallePedido = await DetallePedido.findByPk(req.params.id, { transaction });
    if (detallePedido) {
      await detallePedido.update(req.body, { transaction });
      
      // Recalcular el total del pedido
      const pedido = await Pedido.findByPk(detallePedido.id_pedido, { transaction });
      if (pedido) {
        const detalles = await DetallePedido.findAll({
          where: { id_pedido: pedido.id_pedido },
          transaction
        });
        const subtotal = detalles.reduce((sum, detalle) => sum + Number(detalle.subtotal), 0);
        const total = subtotal + Number(pedido.costo_domicilio);
        await pedido.update({ total }, { transaction });
      }

      await transaction.commit();
      
      res.json(detallePedido);
    } else {
      await transaction.rollback();
      res.status(404).json({ mensaje: 'Detalle de pedido no encontrado' });
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ mensaje: 'Error al actualizar detalle de pedido', error });
  }
};

export const eliminarDetallePedido = async (req: Request, res: Response) => {
  try {
    const detallePedido = await DetallePedido.findByPk(req.params.id);
    if (detallePedido) {
      await detallePedido.destroy();
      res.json({ mensaje: 'Detalle de pedido eliminado' });
    } else {
      res.status(404).json({ mensaje: 'Detalle de pedido no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar detalle de pedido', error });
  }
};

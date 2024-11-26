import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import Usuario from '../models/usuario';
import Pedido from '../models/pedido';
import sequelize from '../config/database';

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await Usuario.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario', error });
  }
};

export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const incluirOcultos = req.query.incluirOcultos === 'true';
    const whereClause = incluirOcultos ? {} : { oculto: false };
    
    const usuarios = await Usuario.findAll({ where: whereClause });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
};

export const obtenerUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (usuario && !usuario.getDataValue('oculto')) {
      res.json(usuario);
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario', error });
  }
};

export const actualizarUsuario = async (req: Request, res: Response) => {
  let transaction: Transaction | undefined;

  try {
    transaction = await sequelize.transaction();

    const usuario = await Usuario.findByPk(req.params.id, { transaction });
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const direccionAnterior = usuario.direccion;
    await usuario.update(req.body, { transaction });

    // Si la dirección ha cambiado, actualizar los pedidos pendientes
    if (req.body.direccion && req.body.direccion !== direccionAnterior) {
      await Pedido.update(
        { direccion_entrega: req.body.direccion },
        {
          where: {
            id_usuario: usuario.id_usuario,
            estado_pedido: ['pendiente', 'en_proceso']
          },
          transaction
        }
      );
    }

    await transaction.commit();
    res.json(usuario);
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error });
  }
};

export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (usuario) {
      await usuario.destroy();
      res.json({ mensaje: 'Usuario eliminado' });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error });
  }
};

export const ocultarUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (usuario) {
      await usuario.update({ oculto: true });
      res.json({ mensaje: 'Usuario ocultado' });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al ocultar usuario', error });
  }
};

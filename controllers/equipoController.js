const { Op } = require('sequelize');
const { Equipo, Prestamo } = require('../models');

const CAMPOS_EQUIPO = ['codigo', 'nombre', 'categoria', 'condicion'];

const parsearId = (valor) => {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const listar = async (req, res) => {
  try {
    const equipos = await Equipo.findAll({ order: [['id', 'ASC']] });
    return res.status(200).json({ datos: equipos });
  } catch (error) {
    console.error('Error al listar equipos:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

const obtener = async (req, res) => {
  try {
    const id = parsearId(req.params.id);

    if (!id) {
      return res.status(400).json({ mensaje: 'El id del equipo no es valido.' });
    }

    const equipo = await Equipo.findByPk(id);

    if (!equipo) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado.' });
    }

    return res.status(200).json({ datos: equipo });
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

const crear = async (req, res) => {
  try {
    const body = req.body || {};
    const datos = {};

    for (const campo of CAMPOS_EQUIPO) {
      if (typeof body[campo] !== 'string' || !body[campo].trim()) {
        return res.status(400).json({
          mensaje: `El campo ${campo} es obligatorio.`
        });
      }
      datos[campo] = body[campo].trim();
    }

    const existente = await Equipo.findOne({
      where: { codigo: datos.codigo }
    });

    if (existente) {
      return res.status(409).json({
        mensaje: 'Ya existe un equipo con ese codigo.'
      });
    }

    const equipo = await Equipo.create(datos);

    return res.status(201).json({
      mensaje: 'Equipo registrado correctamente.',
      datos: equipo
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        mensaje: 'Ya existe un equipo con ese codigo.'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        mensaje: error.errors.map((e) => e.message).join(' ')
      });
    }

    console.error('Error al crear equipo:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

const actualizar = async (req, res) => {
  try {
    const id = parsearId(req.params.id);

    if (!id) {
      return res.status(400).json({ mensaje: 'El id del equipo no es valido.' });
    }

    const equipo = await Equipo.findByPk(id);

    if (!equipo) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado.' });
    }

    const body = req.body || {};
    const cambios = {};

    for (const campo of CAMPOS_EQUIPO) {
      if (Object.prototype.hasOwnProperty.call(body, campo)) {
        if (typeof body[campo] !== 'string' || !body[campo].trim()) {
          return res.status(400).json({
            mensaje: `El campo ${campo} no puede estar vacio.`
          });
        }
        cambios[campo] = body[campo].trim();
      }
    }

    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({
        mensaje:
          'Debe enviar al menos uno de los campos: codigo, nombre, categoria o condicion.'
      });
    }

    if (cambios.codigo && cambios.codigo !== equipo.codigo) {
      const existente = await Equipo.findOne({
        where: {
          codigo: cambios.codigo,
          id: { [Op.ne]: id }
        }
      });

      if (existente) {
        return res.status(409).json({
          mensaje: 'Ya existe otro equipo con ese codigo.'
        });
      }
    }

    await equipo.update(cambios);

    return res.status(200).json({
      mensaje: 'Equipo actualizado correctamente.',
      datos: equipo
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        mensaje: 'Ya existe otro equipo con ese codigo.'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        mensaje: error.errors.map((e) => e.message).join(' ')
      });
    }

    console.error('Error al actualizar equipo:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

const eliminar = async (req, res) => {
  try {
    const id = parsearId(req.params.id);

    if (!id) {
      return res.status(400).json({ mensaje: 'El id del equipo no es valido.' });
    }

    const equipo = await Equipo.findByPk(id);

    if (!equipo) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado.' });
    }

    const cantidadPrestamos = await Prestamo.count({
      where: { equipo_id: id }
    });

    if (cantidadPrestamos > 0) {
      return res.status(409).json({
        mensaje:
          'No se puede eliminar el equipo porque tiene historial de prestamos.'
      });
    }

    await equipo.destroy();

    return res.status(200).json({
      mensaje: 'Equipo eliminado correctamente.'
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        mensaje:
          'No se puede eliminar el equipo porque tiene historial de prestamos.'
      });
    }

    console.error('Error al eliminar equipo:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};

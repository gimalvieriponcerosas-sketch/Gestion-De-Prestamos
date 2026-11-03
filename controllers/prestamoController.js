const { Op } = require('sequelize');
const { sequelize, Equipo, Usuario, Prestamo } = require('../models');

const INCLUDE_PRESTAMO = [
  {
    model: Equipo,
    as: 'equipo',
    attributes: ['id', 'codigo', 'nombre', 'categoria', 'condicion']
  },
  {
    model: Usuario,
    as: 'usuario',
    attributes: ['id', 'nombre', 'correo']
  }
];

const parsearId = (valor) => {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const parsearFechaHora = (valor) => {
  if (typeof valor !== 'string') {
    return null;
  }

  const texto = valor.trim();
  const coincidencia =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.exec(
      texto
    );

  if (!coincidencia) {
    return null;
  }

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  const hora = Number(coincidencia[4]);
  const minuto = Number(coincidencia[5]);
  const segundo = coincidencia[6] === undefined ? 0 : Number(coincidencia[6]);

  const esBisiesto =
    (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
  const diasPorMes = [
    31,
    esBisiesto ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];

  if (
    mes < 1 ||
    mes > 12 ||
    dia < 1 ||
    dia > diasPorMes[mes - 1] ||
    hora > 23 ||
    minuto > 59 ||
    segundo > 59
  ) {
    return null;
  }

  const fecha = new Date(texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const errorHttp = (status, mensaje) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const crear = async (req, res) => {
  try {
    const { equipo_id, prestatario, fecha_prevista } = req.body || {};
    const equipoId = parsearId(equipo_id);

    if (!equipoId) {
      return res.status(400).json({
        mensaje: 'El campo equipo_id es obligatorio y debe ser un id valido.'
      });
    }

    if (typeof prestatario !== 'string' || !prestatario.trim()) {
      return res.status(400).json({
        mensaje: 'El campo prestatario es obligatorio.'
      });
    }

    const fechaPrevista = parsearFechaHora(fecha_prevista);

    if (!fechaPrevista) {
      return res.status(400).json({
        mensaje:
          'El campo fecha_prevista es obligatorio y debe tener un formato ISO 8601 con fecha y hora, por ejemplo 2026-11-05T15:30:00.'
      });
    }

    const fechaPrestamo = new Date();

    if (fechaPrevista.getTime() <= fechaPrestamo.getTime()) {
      return res.status(400).json({
        mensaje: 'La fecha prevista debe ser posterior a la fecha del prestamo.'
      });
    }

    const prestamo = await sequelize.transaction(async (transaction) => {
      // Bloquea la fila del equipo para evitar prestamos simultaneos duplicados.
      const equipo = await Equipo.findByPk(equipoId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!equipo) {
        throw errorHttp(404, 'El equipo no existe.');
      }

      const prestamoActivo = await Prestamo.findOne({
        where: {
          equipo_id: equipoId,
          fecha_devolucion: null
        },
        transaction
      });

      if (prestamoActivo) {
        throw errorHttp(
          409,
          'El equipo ya tiene un prestamo activo y no esta disponible.'
        );
      }

      return Prestamo.create(
        {
          equipo_id: equipoId,
          usuario_id: req.usuario.id,
          prestatario: prestatario.trim(),
          fecha_prestamo: fechaPrestamo,
          fecha_prevista: fechaPrevista,
          fecha_devolucion: null
        },
        { transaction }
      );
    });

    const creado = await Prestamo.findByPk(prestamo.id, {
      include: INCLUDE_PRESTAMO
    });

    return res.status(201).json({
      mensaje: 'Prestamo registrado correctamente.',
      datos: creado
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ mensaje: error.message });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        mensaje: error.errors.map((e) => e.message).join(' ')
      });
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        mensaje: 'El equipo o el usuario indicado no existe.'
      });
    }

    console.error('Error al crear prestamo:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

const listar = async (req, res) => {
  try {
    const where = {};
    const { activo, equipo_id } = req.query;

    if (activo !== undefined) {
      if (activo === 'true') {
        where.fecha_devolucion = null;
      } else if (activo === 'false') {
        where.fecha_devolucion = { [Op.not]: null };
      } else {
        return res.status(400).json({
          mensaje: 'El filtro activo solo acepta los valores true o false.'
        });
      }
    }

    if (equipo_id !== undefined) {
      const equipoId = parsearId(equipo_id);

      if (!equipoId) {
        return res.status(400).json({
          mensaje: 'El filtro equipo_id debe ser un id valido.'
        });
      }

      where.equipo_id = equipoId;
    }

    const prestamos = await Prestamo.findAll({
      where,
      include: INCLUDE_PRESTAMO,
      order: [['id', 'DESC']]
    });

    return res.status(200).json({ datos: prestamos });
  } catch (error) {
    console.error('Error al listar prestamos:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

const devolver = async (req, res) => {
  try {
    const id = parsearId(req.params.id);

    if (!id) {
      return res.status(400).json({ mensaje: 'El id del prestamo no es valido.' });
    }

    const prestamo = await Prestamo.findByPk(id);

    if (!prestamo) {
      return res.status(404).json({ mensaje: 'Prestamo no encontrado.' });
    }

    if (prestamo.fecha_devolucion !== null) {
      return res.status(409).json({
        mensaje: 'El prestamo ya fue devuelto anteriormente.'
      });
    }

    prestamo.fecha_devolucion = new Date();
    await prestamo.save();

    const devuelto = await Prestamo.findByPk(prestamo.id, {
      include: INCLUDE_PRESTAMO
    });

    return res.status(200).json({
      mensaje: 'Devolucion registrada correctamente. El equipo esta disponible nuevamente.',
      datos: devuelto
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        mensaje: error.errors.map((e) => e.message).join(' ')
      });
    }

    console.error('Error al registrar devolucion:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = {
  crear,
  listar,
  devolver
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const datosPublicosUsuario = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  correo: usuario.correo,
  createdAt: usuario.createdAt,
  updatedAt: usuario.updatedAt
});

const registro = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body || {};

    if (
      typeof nombre !== 'string' ||
      typeof correo !== 'string' ||
      typeof contrasena !== 'string' ||
      !nombre.trim() ||
      !correo.trim() ||
      !contrasena
    ) {
      return res.status(400).json({
        mensaje: 'Los campos nombre, correo y contrasena son obligatorios.'
      });
    }

    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      return res.status(400).json({
        mensaje: 'El correo no tiene un formato valido.'
      });
    }

    if (contrasena.length < 6) {
      return res.status(400).json({
        mensaje: 'La contrasena debe tener al menos 6 caracteres.'
      });
    }

    const existente = await Usuario.findOne({
      where: { correo: correoLimpio }
    });

    if (existente) {
      return res.status(409).json({
        mensaje: 'Ya existe un usuario registrado con ese correo.'
      });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({
      nombre: nombreLimpio,
      correo: correoLimpio,
      contrasena: hash
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      datos: datosPublicosUsuario(usuario)
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        mensaje: 'Ya existe un usuario registrado con ese correo.'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        mensaje: error.errors.map((e) => e.message).join(' ')
      });
    }

    console.error('Error en registro:', error);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.'
    });
  }
};

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body || {};

    if (
      typeof correo !== 'string' ||
      typeof contrasena !== 'string' ||
      !correo.trim() ||
      !contrasena
    ) {
      return res.status(400).json({
        mensaje: 'Los campos correo y contrasena son obligatorios.'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        mensaje: 'El servidor no tiene configurado JWT_SECRET.'
      });
    }

    const usuario = await Usuario.findOne({
      where: { correo: correo.trim().toLowerCase() }
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Correo o contrasena incorrectos.'
      });
    }

    const contrasenaValida = await bcrypt.compare(
      contrasena,
      usuario.contrasena
    );

    if (!contrasenaValida) {
      return res.status(401).json({
        mensaje: 'Correo o contrasena incorrectos.'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.status(200).json({
      mensaje: 'Inicio de sesion exitoso.',
      datos: {
        token,
        usuario: datosPublicosUsuario(usuario)
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.'
    });
  }
};

module.exports = {
  registro,
  login
};

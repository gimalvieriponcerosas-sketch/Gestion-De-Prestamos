const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const encabezado = req.headers.authorization || '';

    if (!encabezado.startsWith('Bearer ')) {
      return res.status(401).json({
        mensaje: 'Token no proporcionado. Inicie sesion para continuar.'
      });
    }

    const token = encabezado.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        mensaje: 'Token no proporcionado. Inicie sesion para continuar.'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        mensaje: 'El servidor no tiene configurado JWT_SECRET.'
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(payload.id, {
      attributes: ['id', 'nombre', 'correo']
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'El usuario del token ya no existe.'
      });
    }

    req.usuario = usuario;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: 'El token ha expirado. Inicie sesion nuevamente.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        mensaje: 'Token invalido.'
      });
    }

    console.error('Error en authMiddleware:', error);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.'
    });
  }
};

module.exports = authMiddleware;

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define(
    'Usuario',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre es obligatorio.' }
        }
      },
      correo: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'El correo no tiene un formato valido.' },
          notEmpty: { msg: 'El correo es obligatorio.' }
        }
      },
      contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'La contrasena es obligatoria.' }
        }
      }
    },
    {
      tableName: 'usuarios',
      timestamps: true
    }
  );

  return Usuario;
};

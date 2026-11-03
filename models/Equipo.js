const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Equipo = sequelize.define(
    'Equipo',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'El codigo es obligatorio.' }
        }
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre es obligatorio.' }
        }
      },
      categoria: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'La categoria es obligatoria.' }
        }
      },
      condicion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'La condicion es obligatoria.' }
        }
      }
    },
    {
      tableName: 'equipos',
      timestamps: true
    }
  );

  return Equipo;
};

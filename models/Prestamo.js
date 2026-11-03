const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prestamo = sequelize.define(
    'Prestamo',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      equipo_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      prestatario: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre del prestatario es obligatorio.' }
        }
      },
      fecha_prestamo: {
        type: DataTypes.DATE,
        allowNull: false
      },
      fecha_prevista: {
        type: DataTypes.DATE,
        allowNull: false
      },
      fecha_devolucion: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'prestamos',
      timestamps: true
    }
  );

  return Prestamo;
};

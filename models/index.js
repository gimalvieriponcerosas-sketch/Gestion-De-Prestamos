const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define
  }
);

const Usuario = require('./Usuario')(sequelize);
const Equipo = require('./Equipo')(sequelize);
const Prestamo = require('./Prestamo')(sequelize);

// Relaciones entre las tres entidades del sistema.
Usuario.hasMany(Prestamo, {
  foreignKey: 'usuario_id',
  as: 'prestamos',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Equipo.hasMany(Prestamo, {
  foreignKey: 'equipo_id',
  as: 'prestamos',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Prestamo.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

Prestamo.belongsTo(Equipo, {
  foreignKey: 'equipo_id',
  as: 'equipo'
});

module.exports = {
  sequelize,
  Sequelize,
  Usuario,
  Equipo,
  Prestamo
};

'use strict';

const bcrypt = require('bcryptjs');
const { Usuario, Equipo } = require('../models');

const CONTRASENA_DEMO = 'demo1234';

const equiposDemo = [
  {
    codigo: 'EQ-001',
    nombre: 'Multimetro Digital Fluke 117',
    categoria: 'Instrumentos de medicion',
    condicion: 'Bueno'
  },
  {
    codigo: 'EQ-002',
    nombre: 'Osciloscopio Digital Rigol',
    categoria: 'Instrumentos de medicion',
    condicion: 'Bueno'
  }
];

module.exports = {
  async up() {
    const hash = await bcrypt.hash(CONTRASENA_DEMO, 10);

    await Usuario.findOrCreate({
      where: { correo: 'darwin@senati.pe' },
      defaults: {
        nombre: 'Darwin Uzuriaga',
        correo: 'darwin@senati.pe',
        contrasena: hash
      }
    });

    for (const equipo of equiposDemo) {
      await Equipo.findOrCreate({
        where: { codigo: equipo.codigo },
        defaults: equipo
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', {
      correo: 'darwin@senati.pe'
    });

    await queryInterface.bulkDelete('equipos', {
      codigo: ['EQ-001', 'EQ-002']
    });
  }
};

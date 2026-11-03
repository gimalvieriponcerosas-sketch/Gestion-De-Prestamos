require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const equipoRoutes = require('./routes/equipoRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', authRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/prestamos', prestamoRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

const iniciarServidor = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a MySQL establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a MySQL:', error.message);
    console.error('Verifique su archivo .env y que MySQL este en ejecucion.');
    process.exit(1);
  }
};

iniciarServidor();

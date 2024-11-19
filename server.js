const express = require('express');
const app = express();
const sequelize = require('./src/config/database');
const cors = require('cors');

const Producto = require('./src/models/producto');
const productoRoutes = require('./src/routes/productoRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');


// Configura CORS
app.use(cors({
    origin: 'http://localhost:4200' // Permite solo solicitudes de este origen
}));

app.use(express.json()); // Para poder parsear el cuerpo de las solicitudes JSON

// Definir rutas
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Endpoint para verificar nombre de producto
app.get('/verificar-nombre', async (req, res) => {
    const { nombre } = req.query; // Obtener nombre desde la query

    try {
        const productoExistente = await Producto.findOne({ where: { nombre } });

        if (productoExistente) {
            return res.status(200).json(true);
        } else {
            return res.status(200).json(false);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al verificar el nombre del producto.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

async function testDatabaseConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

testDatabaseConnection();

// Sincronización de modelos para crear las tablas
sequelize.sync({ alter: true })  // 'force: true' recreará las tablas si ya existen ('alter: true' actualiza sin borrar)
    .then(() => {
        console.log('Tablas creadas correctamente.');
    })
    .catch(error => {
        console.error('Error al crear las tablas:', error);
    });

module.exports = app;
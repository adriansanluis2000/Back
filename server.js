const express = require('express');
const productoRoutes = require('./src/routes/productoRoutes');
const app = express();
const sequelize = require('./src/config/database');

app.use(express.json()); // Para poder parsear el cuerpo de las solicitudes JSON

// Definir rutas
app.use('/api/productos', productoRoutes);

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

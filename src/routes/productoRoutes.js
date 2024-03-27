const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// Crear un nuevo producto
router.post('/', productoController.crear);

// Obtener todos los productos
router.get('/', productoController.listar);

// Obtener un producto por su ID
router.get('/:id', productoController.obtenerPorId);

// Actualizar un producto por su ID
router.put('/:id', productoController.actualizar);

// Eliminar un producto por su ID
router.delete('/:id', productoController.eliminar);

module.exports = router;
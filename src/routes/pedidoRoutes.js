const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const router = express.Router();

// Crear un nuevo pedido
router.post('/', pedidoController.crearPedido);

// Obtener todos los pedidos
router.get('/', pedidoController.obtenerPedidos);

// Obtener un pedido por ID
router.get('/:id', pedidoController.obtenerPedidoPorId);

// Eliminar un pedido
router.delete('/:id', pedidoController.eliminarPedido);

module.exports = router;

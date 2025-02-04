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

// Actualizar un pedido existente
router.put('/:id', pedidoController.actualizarPedido);

// Devolver las unidades de los productos de un pedido
router.post('/devolver-stock/:id', pedidoController.devolverStock);

module.exports = router;

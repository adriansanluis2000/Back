const pedidoService = require('../services/pedidoService');

class PedidoController {
  async crearPedido(req, res) {
    try {
      const pedido = await pedidoService.crearPedido(req.body);
      res.status(201).json({ mensaje: 'Pedido registrado con éxito', pedido });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear el pedido', error: error.message });
    }
  }

  async obtenerPedidos(req, res) {
    try {
      const pedidos = await pedidoService.obtenerPedidos();
      res.status(200).json(pedidos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener los pedidos', error });
    }
  }

  async obtenerPedidoPorId(req, res) {
    try {
      const pedido = await pedidoService.obtenerPedidoPorId(req.params.id);
      if (!pedido) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }
      res.status(200).json(pedido);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener el pedido', error });
    }
  }

  async actualizarEstadoPedido(req, res) {
    try {
      const pedidoActualizado = await pedidoService.actualizarEstadoPedido(req.params.id, req.body.estado);
      if (!pedidoActualizado) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }
      res.status(200).json(pedidoActualizado);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar el estado del pedido', error });
    }
  }

  async eliminarPedido(req, res) {
    try {
      const pedidoEliminado = await pedidoService.eliminarPedido(req.params.id);
      if (!pedidoEliminado) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }
      res.status(200).json({ mensaje: 'Pedido eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al eliminar el pedido', error });
    }
  }
}

module.exports = new PedidoController();

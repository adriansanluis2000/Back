const pedidoService = require('../services/pedidoService');

class PedidoController {
  async crearPedido(req, res) {
    try {
      const pedido = await pedidoService.crearPedido(req.body);
      res.status(201).json({ mensaje: 'Pedido registrado con éxito', pedido });
    } catch (error) {
      res.status(500).json({ mensaje: error.message || 'Error al crear el pedido' });
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

  async actualizarPedido(req, res) {
    try {
      const pedidoId = req.params.id;
      const datosPedido = req.body;
      const pedidoActualizado = await pedidoService.actualizarPedido(pedidoId, datosPedido);

      if (!pedidoActualizado) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }

      res.status(200).json({ mensaje: 'Pedido actualizado con éxito', pedido: pedidoActualizado });
    } catch (error) {
      res.status(500).json({ mensaje: error.message || 'Error al actualizar el pedido' });
    }
  }

}

module.exports = new PedidoController();

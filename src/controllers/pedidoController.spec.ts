const pedidoController = require('../controllers/pedidoController');
const pedidoService = require('../services/pedidoService');

jest.mock('../services/pedidoService');

describe('PedidoController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('crearPedido', () => {
        it('debería crear un pedido y devolver un mensaje de éxito', async () => {
            req.body = { item: 'producto', cantidad: 2 };
            pedidoService.crearPedido.mockResolvedValue(req.body);

            await pedidoController.crearPedido(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ mensaje: 'Pedido registrado con éxito', pedido: req.body });
        });

        it('debería manejar errores al crear un pedido', async () => {
            const error = new Error('Error de servicio');
            pedidoService.crearPedido.mockRejectedValue(error);

            await pedidoController.crearPedido(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ mensaje: 'Error de servicio' });
        });
    });

    describe('obtenerPedidos', () => {
        it('debería obtener todos los pedidos', async () => {
            const pedidos = [{ id: 1, item: 'producto' }];
            pedidoService.obtenerPedidos.mockResolvedValue(pedidos);

            await pedidoController.obtenerPedidos(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(pedidos);
        });

        it('debería manejar errores al obtener pedidos', async () => {
            const error = new Error('Error al obtener pedidos');
            pedidoService.obtenerPedidos.mockRejectedValue(error);

            await pedidoController.obtenerPedidos(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ mensaje: 'Error al obtener los pedidos', error });
        });
    });

    describe('obtenerPedidoPorId', () => {
        it('debería obtener un pedido por ID', async () => {
            req.params.id = '1';
            const pedido = { id: 1, item: 'producto' };
            pedidoService.obtenerPedidoPorId.mockResolvedValue(pedido);

            await pedidoController.obtenerPedidoPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(pedido);
        });

        it('debería devolver 404 si el pedido no es encontrado', async () => {
            req.params.id = '2';
            pedidoService.obtenerPedidoPorId.mockResolvedValue(null);

            await pedidoController.obtenerPedidoPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ mensaje: 'Pedido no encontrado' });
        });

        it('debería manejar errores al obtener un pedido por ID', async () => {
            req.params.id = '1';
            const error = new Error('Error al obtener el pedido');
            pedidoService.obtenerPedidoPorId.mockRejectedValue(error);

            await pedidoController.obtenerPedidoPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ mensaje: 'Error al obtener el pedido', error });
        });
    });

    describe('eliminarPedido', () => {
        it('debería eliminar un pedido y devolver un mensaje de éxito', async () => {
            req.params.id = '1';
            pedidoService.eliminarPedido.mockResolvedValue(true);

            await pedidoController.eliminarPedido(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ mensaje: 'Pedido eliminado correctamente' });
        });

        it('debería devolver 404 si el pedido no es encontrado al eliminar', async () => {
            req.params.id = '2';
            pedidoService.eliminarPedido.mockResolvedValue(false);

            await pedidoController.eliminarPedido(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ mensaje: 'Pedido no encontrado' });
        });

        it('debería manejar errores al eliminar un pedido', async () => {
            req.params.id = '1';
            const error = new Error('Error al eliminar el pedido');
            pedidoService.eliminarPedido.mockRejectedValue(error);

            await pedidoController.eliminarPedido(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ mensaje: 'Error al eliminar el pedido', error });
        });
    });
});

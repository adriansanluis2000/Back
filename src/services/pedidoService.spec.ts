const PedidoService = require('../services/pedidoService');
const { Pedido, PedidoProducto } = require('../models/pedido');
const Producto = require('../models/producto');

jest.mock('../models/pedido', () => {
    return {
        Pedido: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByPk: jest.fn(),
            destroy: jest.fn(),
            belongsToMany: jest.fn(),
        },
        PedidoProducto: {
            create: jest.fn(),
        }
    };
});

jest.mock('../models/producto', () => {
    return {
        findAll: jest.fn(),
        belongsToMany: jest.fn(),
    };
});

describe('PedidoService', () => {
    let datosPedido;

    beforeEach(() => {
        datosPedido = {
            fecha: new Date(),
            productos: [
                { id: 1, cantidad: 2 },
                { id: 2, cantidad: 3 }
            ]
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('crearPedido', () => {
        it('debería crear un pedido con productos válidos', async () => {
            const mockProducto1 = { id: 1, stock: 5, precio: 100, nombre: 'Producto 1', update: jest.fn() };
            const mockProducto2 = { id: 2, stock: 10, precio: 50, nombre: 'Producto 2', update: jest.fn() };

            Producto.findAll.mockResolvedValue([mockProducto1, mockProducto2]);
            Pedido.create.mockResolvedValue({ id: 1 });

            const resultado = await PedidoService.crearPedido(datosPedido);

            expect(Pedido.create).toHaveBeenCalled();
            expect(PedidoProducto.create).toHaveBeenCalledTimes(2);
            expect(mockProducto1.update).toHaveBeenCalledWith({ stock: 3 });
            expect(mockProducto2.update).toHaveBeenCalledWith({ stock: 7 });
            expect(resultado).toEqual({ id: 1 });
        });

        it('debería lanzar un error si un producto no existe', async () => {
            Producto.findAll.mockResolvedValue([{ id: 1, stock: 5, precio: 100, nombre: 'Producto 1' }]);

            await expect(PedidoService.crearPedido(datosPedido)).rejects.toThrow('Uno o más productos no existen en la base de datos.');
        });

        it('debería lanzar un error si la cantidad solicitada supera el stock', async () => {
            Producto.findAll.mockResolvedValue([
                { id: 1, stock: 1, precio: 100, nombre: 'Producto 1' },
                { id: 2, stock: 10, precio: 50, nombre: 'Producto 2' }
            ]);

            await expect(PedidoService.crearPedido(datosPedido)).rejects.toThrow('El producto "Producto 1" no tiene suficiente stock.');
        });

        it('debería lanzar un error si ocurre un problema al crear el pedido', async () => {
            Producto.findAll.mockResolvedValue([
                { id: 1, stock: 5, precio: 100, nombre: 'Producto 1' },
                { id: 2, stock: 10, precio: 50, nombre: 'Producto 2' }
            ]);
            Pedido.create.mockRejectedValue(new Error('Error al guardar el pedido'));

            await expect(PedidoService.crearPedido(datosPedido)).rejects.toThrow('Error al crear el pedido: Error al guardar el pedido');
        });
    });

    describe('obtenerPedidos', () => {
        it('debería retornar todos los pedidos', async () => {
            Pedido.findAll.mockResolvedValue([]);

            const resultados = await PedidoService.obtenerPedidos();

            expect(Pedido.findAll).toHaveBeenCalled();
            expect(resultados).toEqual([]);
        });

        it('debería lanzar un error si hay un problema al obtener los pedidos', async () => {
            Pedido.findAll.mockRejectedValue(new Error('Error al obtener pedidos'));

            await expect(PedidoService.obtenerPedidos()).rejects.toThrow('Error al obtener los pedidos: Error al obtener pedidos');
        });
    });

    describe('obtenerPedidoPorId', () => {
        it('debería retornar un pedido existente', async () => {
            const pedidoMock = { id: 1 };
            Pedido.findByPk.mockResolvedValue(pedidoMock);

            const resultado = await PedidoService.obtenerPedidoPorId(1);

            expect(Pedido.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(resultado).toEqual(pedidoMock);
        });

        it('debería lanzar un error si el pedido no existe', async () => {
            Pedido.findByPk.mockResolvedValue(null);

            await expect(PedidoService.obtenerPedidoPorId(999)).rejects.toThrow('Pedido no encontrado.');
        });

        it('debería lanzar un error si hay un problema al obtener el pedido', async () => {
            Pedido.findByPk.mockRejectedValue(new Error('Error al obtener el pedido'));

            await expect(PedidoService.obtenerPedidoPorId(1)).rejects.toThrow('Error al obtener el pedido: Error al obtener el pedido');
        });
    });

    describe('eliminarPedido', () => {
        it('debería eliminar un pedido existente', async () => {
            Pedido.destroy.mockResolvedValue(1);

            const resultado = await PedidoService.eliminarPedido(1);

            expect(Pedido.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(resultado).toEqual({ mensaje: 'Pedido eliminado con éxito.' });
        });

        it('debería lanzar un error si el pedido no existe', async () => {
            Pedido.destroy.mockResolvedValue(0);

            await expect(PedidoService.eliminarPedido(999)).rejects.toThrow('Pedido no encontrado.');
        });

        it('debería lanzar un error si hay un problema al eliminar el pedido', async () => {
            Pedido.destroy.mockRejectedValue(new Error('Error al eliminar el pedido'));

            await expect(PedidoService.eliminarPedido(1)).rejects.toThrow('Error al eliminar el pedido: Error al eliminar el pedido');
        });
    });
});

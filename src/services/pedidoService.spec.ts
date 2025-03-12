const PedidoService = require('../services/pedidoService');
const { Pedido, ProductoPedido } = require('../models/pedido');
const Producto = require('../models/producto');
const { Op } = require('sequelize');

jest.mock('../models/pedido', () => {
    return {
        Pedido: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByPk: jest.fn(),
            destroy: jest.fn(),
            belongsToMany: jest.fn(),
        },
        ProductoPedido: {
            create: jest.fn(),
        }
    };
});

jest.mock('../models/producto', () => {
    return {
        findAll: jest.fn(),
        belongsToMany: jest.fn(),
        update: jest.fn()
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
            ],
            tipo: 'entrante'
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
            expect(ProductoPedido.create).toHaveBeenCalledTimes(2);
            expect(mockProducto1.update).toHaveBeenCalledWith({ stock: 3 });
            expect(mockProducto2.update).toHaveBeenCalledWith({ stock: 7 });
            expect(resultado).toEqual({ id: 1 });
        });

        it('debería lanzar un error si un producto no existe', async () => {
            Producto.findAll.mockResolvedValue([{ id: 1, stock: 5, precio: 100, nombre: 'Producto 1' }]);

            await expect(PedidoService.crearPedido(datosPedido)).rejects.toThrow('Uno o más productos no existen en la base de datos.');
        });

        it('debería lanzar un error si el tipo es "entrante" y el stock es insuficiente', async () => {
            const mockProducto1 = { id: 1, stock: 1, precio: 100, nombre: 'Producto 1' };
            const mockProducto2 = { id: 2, stock: 10, precio: 50, nombre: 'Producto 2' };

            Producto.findAll.mockResolvedValue([mockProducto1, mockProducto2]);

            const datosPedidoEntranteConError = {
                fecha: new Date(),
                productos: [
                    { id: 1, cantidad: 2 },
                    { id: 2, cantidad: 3 }
                ],
                tipo: 'entrante'
            };

            await expect(PedidoService.crearPedido(datosPedidoEntranteConError)).rejects.toThrow('Error al crear el pedido: El producto "Producto 1" no tiene suficiente stock.');
        });

        it('debería crear un pedido tipo "entrante" y actualizar el stock correctamente', async () => {
            const mockProducto1 = { id: 1, stock: 5, precio: 100, nombre: 'Producto 1', update: jest.fn() };
            const mockProducto2 = { id: 2, stock: 10, precio: 50, nombre: 'Producto 2', update: jest.fn() };

            Producto.findAll.mockResolvedValue([mockProducto1, mockProducto2]);
            Pedido.create.mockResolvedValue({ id: 1 });

            const datosPedidoEntrante = {
                fecha: new Date(),
                productos: [
                    { id: 1, cantidad: 2 },
                    { id: 2, cantidad: 3 }
                ],
                tipo: 'entrante'
            };

            const resultado = await PedidoService.crearPedido(datosPedidoEntrante);

            expect(Pedido.create).toHaveBeenCalled();
            expect(ProductoPedido.create).toHaveBeenCalledTimes(2);

            // Verificar actualización de stock
            expect(mockProducto1.update).toHaveBeenCalledWith({ stock: 3 }); // 5 - 2
            expect(mockProducto2.update).toHaveBeenCalledWith({ stock: 7 }); // 10 - 3

            expect(resultado).toEqual({ id: 1 });
        });

        it('debería crear un pedido tipo "saliente" y actualizar el stock correctamente', async () => {
            const mockProducto1 = { id: 1, stock: 5, precio: 100, nombre: 'Producto 1', update: jest.fn() };
            const mockProducto2 = { id: 2, stock: 10, precio: 50, nombre: 'Producto 2', update: jest.fn() };

            Producto.findAll.mockResolvedValue([mockProducto1, mockProducto2]);
            Pedido.create.mockResolvedValue({ id: 1 });

            const datosPedidoSaliente = {
                fecha: new Date(),
                productos: [
                    { id: 1, cantidad: 2 },
                    { id: 2, cantidad: 3 }
                ],
                tipo: 'saliente'
            };

            const resultado = await PedidoService.crearPedido(datosPedidoSaliente);

            expect(Pedido.create).toHaveBeenCalled();
            expect(ProductoPedido.create).toHaveBeenCalledTimes(2);

            // Verificar actualización de stock
            expect(mockProducto1.update).toHaveBeenCalledWith({ stock: 7 }); // 5 + 2
            expect(mockProducto2.update).toHaveBeenCalledWith({ stock: 13 }); // 10 + 3

            expect(resultado).toEqual({ id: 1 });
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

        it('debería obtener solo los pedidos de tipo "entrante"', async () => {
            const mockPedido = { id: 1, tipo: 'entrante' };

            Pedido.findAll.mockResolvedValue([mockPedido]);

            const resultados = await PedidoService.obtenerPedidos('entrante');

            expect(Pedido.findAll).toHaveBeenCalledWith({ where: { tipo: { [Op.eq]: 'entrante' } }, include: expect.any(Object) });
            expect(resultados).toEqual([mockPedido]);
        });

        it('debería obtener todos los pedidos si no se especifica tipo', async () => {
            const mockPedido1 = { id: 1, tipo: 'entrante' };
            const mockPedido2 = { id: 2, tipo: 'saliente' };

            Pedido.findAll.mockResolvedValue([mockPedido1, mockPedido2]);

            const resultados = await PedidoService.obtenerPedidos();

            expect(Pedido.findAll).toHaveBeenCalledWith({ where: {}, include: expect.any(Object) });
            expect(resultados).toEqual([mockPedido1, mockPedido2]);
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

    describe('actualizarPedido', () => {
        it('debería actualizar un pedido con éxito', async () => {
            const id = 1;
            const datosPedido = {
                productos: [
                    { id: 1, cantidad: 2 },
                    { id: 2, cantidad: 1 }
                ],
                tipo: 'entrante'
            };

            const pedidoMock = {
                id: 1,
                Productos: [
                    { id: 1, ProductoPedido: { cantidad: 1 } },
                    { id: 2, ProductoPedido: { cantidad: 1 } }
                ],
                tipo: 'saliente',
                update: jest.fn(),
                precioTotal: 100
            };

            const productoMock1 = { id: 1, stock: 10, precio: 50, update: jest.fn() };
            const productoMock2 = { id: 2, stock: 5, precio: 30, update: jest.fn() };

            Pedido.findByPk = jest.fn().mockResolvedValue(pedidoMock);
            Producto.findByPk = jest.fn().mockImplementation((id) => {
                return id === 1 ? productoMock1 : id === 2 ? productoMock2 : null;
            });
            ProductoPedido.destroy = jest.fn().mockResolvedValue(true);
            ProductoPedido.create = jest.fn().mockResolvedValue(true);

            const resultado = await PedidoService.actualizarPedido(id, datosPedido);

            expect(Pedido.findByPk).toHaveBeenCalledWith(id, expect.any(Object));
            expect(Producto.findByPk).toHaveBeenCalledWith(1);
            expect(Producto.findByPk).toHaveBeenCalledWith(2);
            expect(pedidoMock.update).toHaveBeenCalledWith({ precioTotal: expect.any(Number), tipo: 'entrante' });
            expect(resultado).toHaveProperty('id', id);
        });

        it('debería lanzar un error si no se encuentra el pedido', async () => {
            const id = 9999; // Un id que no existe
            const datosPedido = {
                productos: [
                    { id: 1, cantidad: 2 }
                ],
                tipo: 'entrante'
            };

            Pedido.findByPk = jest.fn().mockResolvedValue(null);

            await expect(PedidoService.actualizarPedido(id, datosPedido)).rejects.toThrow('Pedido no encontrado.');
        });

        it('debería lanzar un error si un producto no se encuentra', async () => {
            const id = 1;
            const datosPedido = {
                productos: [
                    { id: 999, cantidad: 2 } // Producto que no existe
                ],
                tipo: 'entrante'
            };

            const pedidoMock = { id: 1, Productos: [], tipo: 'saliente', update: jest.fn() };
            Pedido.findByPk = jest.fn().mockResolvedValue(pedidoMock);
            Producto.findByPk = jest.fn().mockResolvedValue(null); // Simulamos que no existe el producto

            // Esperar que se lance un error
            await expect(PedidoService.actualizarPedido(id, datosPedido)).rejects.toThrow('Producto con ID 999 no encontrado.');
        });

        it('debería lanzar un error si no hay suficiente stock de un producto', async () => {
            const id = 1;
            const datosPedido = {
                productos: [
                    { id: 1, cantidad: 15 } // Más cantidad de la que hay en stock
                ],
                tipo: 'entrante'
            };

            const pedidoMock = { id: 1, Productos: [], tipo: 'saliente', update: jest.fn() };
            const productoMock = { id: 1, stock: 10, precio: 50, update: jest.fn() };

            Pedido.findByPk = jest.fn().mockResolvedValue(pedidoMock);
            Producto.findByPk = jest.fn().mockResolvedValue(productoMock);

            await expect(PedidoService.actualizarPedido(id, datosPedido)).rejects.toThrow('Error al actualizar el pedido: El producto "1" no tiene suficiente stock.');
        });

        it('debería manejar errores inesperados', async () => {
            const id = 1;
            const datosPedido = {
                productos: [
                    { id: 1, cantidad: 2 }
                ],
                tipo: 'entrante'
            };

            // Forzamos un error en la búsqueda del pedido
            Pedido.findByPk = jest.fn().mockRejectedValue(new Error('Error interno'));

            await expect(PedidoService.actualizarPedido(id, datosPedido)).rejects.toThrow('Error al actualizar el pedido: Error interno');
        });

        it('debería revertir el stock de los productos si el pedido es de tipo "entrante"', async () => {
            const id = 1;
            const datosPedido = {
                productos: [{ id: 1, cantidad: 2 }],
                tipo: 'saliente', // Nuevo tipo del pedido
            };

            const pedidoMock = {
                id: 1,
                tipo: 'entrante', // Tipo original es "entrante"
                Productos: [
                    { id: 1, ProductoPedido: { cantidad: 5 } },
                ],
                update: jest.fn(),
            };

            const productoMock = { id: 1, stock: 10, update: jest.fn() };

            Pedido.findByPk = jest.fn().mockResolvedValue(pedidoMock);
            Producto.findByPk = jest.fn().mockResolvedValue(productoMock);
            ProductoPedido.destroy = jest.fn().mockResolvedValue(true);

            await PedidoService.actualizarPedido(id, datosPedido);

            // Verifica que el stock se incrementa al revertir el pedido tipo "entrante"
            expect(productoMock.update).toHaveBeenCalledWith({ stock: 15 }); // 10 + 5 (stock actual + cantidad del pedido previo)
        });

    })

    describe('devolverStock', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
    
        it('debería devolver el stock y eliminar el pedido con éxito', async () => {
            const mockPedido = {
                Productos: [
                    { id: 1, ProductoPedido: { cantidad: 10 } },
                    { id: 2, ProductoPedido: { cantidad: 5 } }
                ]
            };
    
            const mockProducto1 = { stock: 20, update: jest.fn() };
            const mockProducto2 = { stock: 30, update: jest.fn() };
    
            Pedido.findByPk.mockResolvedValue(mockPedido);
            Producto.findByPk.mockImplementation((id) => {
                if (id === 1) return Promise.resolve(mockProducto1);
                if (id === 2) return Promise.resolve(mockProducto2);
            });
            Pedido.destroy.mockResolvedValue();
    
            const result = await PedidoService.devolverStock(1);
    
            expect(Pedido.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(Producto.findByPk).toHaveBeenCalledTimes(2);
            expect(mockProducto1.update).toHaveBeenCalledWith({ stock: 30 });
            expect(mockProducto2.update).toHaveBeenCalledWith({ stock: 35 });
            expect(Pedido.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual({ mensaje: 'Stock devuelto y pedido eliminado con éxito.' });
        });
    
        it('debería lanzar un error si no se encuentra el pedido', async () => {
            Pedido.findByPk.mockResolvedValue(null);
    
            await expect(PedidoService.devolverStock(1)).rejects.toThrow('Pedido no encontrado.');
            expect(Pedido.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(Pedido.destroy).not.toHaveBeenCalled();
        });
    
        it('debería manejar errores durante la devolución de stock y eliminación del pedido', async () => {
            Pedido.findByPk.mockRejectedValue(new Error('Database error'));
    
            await expect(PedidoService.devolverStock(1)).rejects.toThrow('Error al devolver el stock: Database error');
            expect(Pedido.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(Pedido.destroy).not.toHaveBeenCalled();
        });
    })
});

const productoServicee = require('../services/productoService');
const Producto = require('../models/producto');

jest.mock('../models/producto');

describe('ProductoService', () => {

    describe('crearProducto', () => {
        it('debería crear un producto exitosamente y devolverlo', async () => {
            const datosProducto = { nombre: 'Producto 1', precio: 100, stock: 10, umbral: 5 };
            const productoMock = { id: 1, ...datosProducto };

            Producto.create.mockResolvedValue(productoMock);

            const resultado = await productoServicee.crearProducto(datosProducto);

            expect(resultado).toEqual(productoMock);
            expect(Producto.create).toHaveBeenCalledWith(datosProducto);
        });

        it('debería lanzar un error si ocurre un error al crear el producto', async () => {
            const datosProducto = { nombre: 'Producto 1', precio: 100, stock: 10, umbral: 5 };
            const errorMock = new Error('Error al crear el producto');

            Producto.create.mockRejectedValue(errorMock);

            await expect(productoServicee.crearProducto(datosProducto)).rejects.toThrow('Error al crear el producto: Error al crear el producto');
        });
    });

    describe('obtenerTodosLosProductos', () => {
        it('debería devolver todos los productos', async () => {
            const productosMock = [{ id: 1, nombre: 'Producto 1' }, { id: 2, nombre: 'Producto 2' }];

            Producto.findAll.mockResolvedValue(productosMock);

            const resultado = await productoServicee.obtenerTodosLosProductos();

            expect(resultado).toEqual(productosMock);
            expect(Producto.findAll).toHaveBeenCalled();
        });

        it('debería lanzar un error si ocurre un error al obtener los productos', async () => {
            const errorMock = new Error('Error al obtener los productos');

            Producto.findAll.mockRejectedValue(errorMock);

            await expect(productoServicee.obtenerTodosLosProductos()).rejects.toThrow('Error al obtener los productos: Error al obtener los productos');
        });
    });

    describe('obtenerProductoPorId', () => {
        it('debería devolver un producto por ID', async () => {
            const productoMock = { id: 1, nombre: 'Producto 1' };
            const idMock = 1;

            Producto.findByPk.mockResolvedValue(productoMock);

            const resultado = await productoServicee.obtenerProductoPorId(idMock);

            expect(resultado).toEqual(productoMock);
            expect(Producto.findByPk).toHaveBeenCalledWith(idMock);
        });

        it('debería lanzar un error si el producto no se encuentra', async () => {
            const idMock = 1;

            Producto.findByPk.mockResolvedValue(null);

            await expect(productoServicee.obtenerProductoPorId(idMock)).rejects.toThrow('Producto no encontrado');
        });

        it('debería lanzar un error si ocurre un error al obtener el producto', async () => {
            const idMock = 1;
            const errorMock = new Error('Error al obtener el producto');

            Producto.findByPk.mockRejectedValue(errorMock);

            await expect(productoServicee.obtenerProductoPorId(idMock)).rejects.toThrow('Error al obtener el producto: Error al obtener el producto');
        });
    });

    describe('actualizarProducto', () => {
        it('debería actualizar un producto y devolverlo', async () => {
            const productoMock = { id: 1, nombre: 'Producto 1', precio: 10, stock: 20, umbral: 10 };
            const datosParaActualizar = { nombre: 'Producto Actualizado' };
            const idMock = 1;

            Producto.findByPk.mockResolvedValue({
                ...productoMock,
                update: jest.fn().mockResolvedValue({ ...datosParaActualizar }),
            });

            const resultado = await productoServicee.actualizarProducto(idMock, datosParaActualizar);

            expect(resultado).toEqual({ ...productoMock, ...datosParaActualizar });
            expect(Producto.findByPk).toHaveBeenCalledWith(idMock);
        });

        it('debería lanzar un error si el producto no se encuentra', async () => {
            const idMock = 1;
            Producto.findByPk.mockResolvedValue(null);

            await expect(productoServicee.actualizarProducto(idMock, {})).rejects.toThrow('Producto no encontrado');
        });

        it('debería lanzar un error si ocurre un error al actualizar el producto', async () => {
            const idMock = 1;
            const errorMock = new Error('Error al actualizar el producto');

            Producto.findByPk.mockResolvedValue({
                update: jest.fn().mockRejectedValue(errorMock),
            });

            await expect(productoServicee.actualizarProducto(idMock, {})).rejects.toThrow('Error al actualizar el producto: Error al actualizar el producto');
        });
    });

    describe('eliminarProducto', () => {
        it('debería eliminar un producto y devolver un mensaje de éxito', async () => {
            const idMock = 1;

            Producto.findByPk.mockResolvedValue({
                destroy: jest.fn().mockReturnThis(),
            });

            const resultado = await productoServicee.eliminarProducto(idMock);

            expect(resultado).toEqual({ message: 'Producto eliminado con éxito' });
            expect(Producto.findByPk).toHaveBeenCalledWith(idMock);
        });

        it('debería lanzar un error si el producto no se encuentra', async () => {
            const idMock = 1;

            Producto.findByPk.mockResolvedValue(null);

            await expect(productoServicee.eliminarProducto(idMock)).rejects.toThrow('Producto no encontrado');
        });

        it('debería lanzar un error si ocurre un error al eliminar el producto', async () => {
            const idMock = 1;
            const errorMock = new Error('Error al eliminar el producto');

            Producto.findByPk.mockResolvedValue({
                destroy: jest.fn().mockRejectedValue(errorMock),
            });

            await expect(productoServicee.eliminarProducto(idMock)).rejects.toThrow('Error al eliminar el producto: Error al eliminar el producto');
        });
    });
});
const productoServicee = require('../services/productoService');
const Producto = require('../models/producto');
const { ValidationError } = require('sequelize');

jest.mock('../models/producto');

describe('ProductoService', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('crearProducto', () => {
        test('should create a new product', async () => {
            const datosProducto = { name: 'Product 1', price: 10 };
            const createdProduct = { id: 1, ...datosProducto };
            Producto.create.mockResolvedValue(createdProduct);

            const result = await productoServicee.crearProducto(datosProducto);

            expect(Producto.create).toHaveBeenCalledWith(datosProducto);
            expect(result).toEqual(createdProduct);
        });

        test('should throw a ValidationError if there are validation errors', async () => {
            const datosProducto = { name: 'Product 1', price: 'invalid' };
            const validationError = new ValidationError('Error de validación', [
                { message: 'Invalid price', type: 'Validation error' },
            ]);
            Producto.create.mockRejectedValue(validationError);

            await expect(productoServicee.crearProducto(datosProducto)).rejects.toThrow(
                ValidationError
            );
        });

        test('should throw an error if any other error occurs', async () => {
            const datosProducto = { name: 'Product 1', price: 10 };
            const error = new Error('Some error');
            Producto.create.mockRejectedValue(error);

            await expect(productoServicee.crearProducto(datosProducto)).rejects.toThrow(
                Error
            );
        });
    });

    describe('obtenerTodosLosProductos', () => {
        test('should return all products', async () => {
            const products = [{ id: 1, name: 'Product 1', price: 10 }];
            Producto.findAll.mockResolvedValue(products);

            const result = await productoServicee.obtenerTodosLosProductos();

            expect(Producto.findAll).toHaveBeenCalled();
            expect(result).toEqual(products);
        });

        test('should throw an error if any error occurs', async () => {
            const error = new Error('Some error');
            Producto.findAll.mockRejectedValue(error);

            await expect(productoServicee.obtenerTodosLosProductos()).rejects.toThrow(
                Error
            );
        });
    });

    describe('obtenerProductoPorId', () => {
        test('should return the product with the given id', async () => {
            const id = 1;
            const product = { id, name: 'Product 1', price: 10 };
            Producto.findByPk.mockResolvedValue(product);

            const result = await productoServicee.obtenerProductoPorId(id);

            expect(Producto.findByPk).toHaveBeenCalledWith(id);
            expect(result).toEqual(product);
        });

        test('should throw an error if the product is not found', async () => {
            const id = 1;
            Producto.findByPk.mockResolvedValue(null);

            await expect(productoServicee.obtenerProductoPorId(id)).rejects.toThrow(
                Error
            );
        });

        test('should throw an error if any other error occurs', async () => {
            const id = 1;
            const error = new Error('Some error');
            Producto.findByPk.mockRejectedValue(error);

            await expect(productoServicee.obtenerProductoPorId(id)).rejects.toThrow(
                Error
            );
        });
    });

    describe('actualizarProducto', () => {
        test('should update the product with the given id', async () => {
            const id = 1;
            const datosParaActualizar = { name: 'Updated Product', price: 20 };
            const product = { id, name: 'Product 1', price: 10 };
            const updatedProduct = { id, ...datosParaActualizar };
            Producto.findByPk.mockResolvedValue(product);
            const updateMock = jest.fn().mockResolvedValue(datosParaActualizar);
            const updateFunction = jest.fn(() => ({ update: updateMock }));

            const result = await productoServicee.actualizarProducto(id, datosParaActualizar);

            expect(Producto.findByPk).toHaveBeenCalledWith(id);
            expect(updateMock).toHaveBeenCalled();
            expect(updateFunction).toHaveBeenCalled();
            expect(result).toEqual(updatedProduct);
        });

        test('should throw an error if the product is not found', async () => {
            const id = 1;
            Producto.findByPk.mockResolvedValue(null);

            await expect(productoServicee.actualizarProducto(id, {})).rejects.toThrow(
                Error
            );
        });

        test('should throw an error if any other error occurs', async () => {
            const id = 1;
            const error = new Error('Some error');
            Producto.findByPk.mockRejectedValue(error);

            await expect(productoServicee.actualizarProducto(id, {})).rejects.toThrow(
                Error
            );
        });
    });

    describe('eliminarProducto', () => {
        test('should delete the product with the given id', async () => {
            const id = 1;
            const product = { id, name: 'Product 1', price: 10 };
            Producto.findByPk.mockResolvedValue(product);
            const destroyMock = jest.fn().mockResolvedValue('');
            const destroyFunction = jest.fn(() => ({ destroy: destroyMock }));
        
            const result = await productoServicee.eliminarProducto(id);
        
            expect(Producto.findByPk).toHaveBeenCalledWith(id);
            expect(destroyFunction).toHaveBeenCalled();
            expect(destroyMock).toHaveBeenCalled();
            expect(result).toEqual({ message: 'Producto eliminado con éxito' });
        });

        test('should throw an error if the product is not found', async () => {
            const id = 1;
            Producto.findByPk.mockResolvedValue(null);

            await expect(productoServicee.eliminarProducto(id)).rejects.toThrow(
                Error
            );
        });

        test('should throw an error if any other error occurs', async () => {
            const id = 1;
            const error = new Error('Some error');
            Producto.findByPk.mockRejectedValue(error);

            await expect(productoServicee.eliminarProducto(id)).rejects.toThrow(
                Error
            );
        });
    });
});

const productoService = require('../../src/services/productoService');
const Producto = require('../../src/models/producto');

jest.mock('../../src/models/producto', () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
}));

describe("Producto Service", () => {
    describe("Crear un nuevo producto", () => {
        test("Se crea correctamente el producto", async () => {
            const nuevoProducto = { nombre: "Laptop", precio: 1500, stock: 2 };
            Producto.create.mockResolvedValue(nuevoProducto);

            const resultado = await productoService.crearProducto(nuevoProducto);

            expect(Producto.create).toHaveBeenCalledWith(nuevoProducto);
            expect(resultado).toEqual(nuevoProducto);
        })

        test("Se produce un error al crear el producto", async () => {
            Producto.create.mockRejectedValue(new Error('Error al crear el producto'));

            await expect(productoService.crearProducto({ nombre: 'Cafetera', precio: 99.95, stock: 3 }))
                .rejects.toThrow('Error al crear el producto');
        })
    })

    describe("Obtener todos los productos", () => {
        test("Se obtienen correctamente todos los productos", async () => {
            const listaDeProductos = [
                { nombre: "Televisor", precio: 800, stock: 4 },
                { nombre: "Tablet", precio: 400, stock: 6 }
            ];
            Producto.findAll.mockResolvedValue(listaDeProductos);

            const resultado = await productoService.obtenerTodosLosProductos();

            expect(Producto.findAll).toHaveBeenCalledTimes(1);
            expect(resultado).toEqual(listaDeProductos);
        })

        test('Se produce un error al obtener los productos', async () => {
            Producto.findAll.mockRejectedValue(new Error('Error al obtener los productos'));

            await expect(productoService.obtenerTodosLosProductos())
                .rejects.toThrow('Error al obtener los productos');
        })
    })

    describe("Obtener producto por ID", () => {
        test("Se obtiene el producto correctamente", async () => {
            const productoNuevo = { id: 1, nombre: "Laptop" };
            Producto.findByPk.mockResolvedValue(productoNuevo);

            const resultado = await productoService.obtenerProductoPorId(1);

            expect(Producto.findByPk).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(productoNuevo);
        })

        test("No se encuentra el producto", async () => {
            // Configura el mock para que retorne null, simulando un producto no encontrado
            Producto.findByPk.mockResolvedValue(null);

            await expect(productoService.obtenerProductoPorId(0)).rejects.toThrow('Producto no encontrado');
        })

        test("Debe lanzar un error cuando la consulta falla", async () => {
            // Configura el mock para que lance un error
            Producto.findByPk.mockRejectedValue(new Error('Error de base de datos'));

            await expect(productoService.obtenerProductoPorId(2)).rejects.toThrow('Error al obtener el producto: Error de base de datos');
        })
    })

    describe("Actualizar producto", () => {
        test("Se actualiza el producto correctamente", async () => {
            const productoNuevo = {
                id: 1,
                nombre: "Producto original",
                update: jest.fn().mockResolvedValue({ id: 1, name: "Producto actualizado" })
            };
            Producto.findByPk.mockResolvedValue(productoNuevo);

            const datosParaActualizar = { nombre: "Producto actualizado" };
            const resultado = await productoService.actualizarProducto(1, datosParaActualizar);

            expect(Producto.update).toHaveBeenCalledWith(datosParaActualizar);
            expect(resultado.nombre).toEqual("Producto actualizado");
        })

        test("Debe lanzar un error cuando el producto no se encuentra", async () => {
            // Simula que no se encontró un producto
            Producto.findByPk.mockResolvedValue(null);

            const datosParaActualizar = { nombre: "Nuevo Nombre" };
            await expect(productoService.actualizarProducto(999, datosParaActualizar)).rejects.toThrow('Producto no encontrado');
        })

        test("Debe lanzar un error cuando la actualización falla", async () => {
            // Simula que se encontró un producto pero la actualización falla
            const fakeProduct = {
                id: 1,
                nombre: "Producto Original",
                update: jest.fn().mockRejectedValue(new Error('Error al actualizar'))
            };
            Producto.findByPk.mockResolvedValue(fakeProduct);

            const datosParaActualizar = { nombre: 'Producto Mal Actualizado' };
            await expect(productoService.actualizarProducto(1, datosParaActualizar)).rejects.toThrow('Error al actualizar el producto: Error al actualizar');
        })
    })

    describe("Eliminar producto", () => {
        test("Eliminar un producto existente correctamente", async () => {
            const response = await productoService.eliminarProducto(2);
            expect(response).toEqual({ message: 'Producto eliminado con éxito' });
            expect(Producto.findByPk).toHaveBeenCalledWith(2);

            const producto = await Producto.findByPk(2);
            expect(producto.destroy).toHaveBeenCalled();
        })

        test("Debería lanzar un error si el producto no existe", async () => {
            Producto.findByPk.mockResolvedValue(null);

            await expect(productoService.eliminarProducto(2)).rejects.toThrow('Producto no encontrado');
            expect(Producto.findByPk).toHaveBeenCalledWith(2);
        })

        test("Debería manejar errores generales", async () => {
            Producto.findByPk.mockRejectedValueOnce(new Error('Error de base de datos'));
            await expect(productoService.eliminarProducto(2)).rejects.toThrow('Error al eliminar el producto: Error de base de datos');
        });
    })
});
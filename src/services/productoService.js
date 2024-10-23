const Producto = require('../models/producto');

class ProductoService {
    async crearProducto(datosProducto) {
        if (!datosProducto.nombre || typeof datosProducto.nombre !== 'string') {
            throw new Error("El nombre es requerido y debe ser una cadena de texto válida");
        }

        if (typeof datosProducto.precio !== 'number' || datosProducto.precio <= 0) {
            throw new Error("El precio es requerido y debe ser un número positivo");
        }

        if (typeof datosProducto.stock !== 'number' || datosProducto.stock < 0) {
            throw new Error("El stock es requerido y debe ser un número no negativo");
        }

        try {
            const producto = await Producto.create(datosProducto);
            return producto;
        } catch (error) {
            throw new Error('Error al crear el producto: ' + error.message);
        }
    }


    async obtenerTodosLosProductos() {
        try {
            const productos = await Producto.findAll();
            return productos;
        } catch (error) {
            throw new Error('Error al obtener los productos: ' + error.message);
        }
    }

    async obtenerProductoPorId(id) {
        try {
            const producto = await Producto.findByPk(id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            return producto;
        } catch (error) {
            throw new Error('Error al obtener el producto: ' + error.message);
        }
    }

    async actualizarProducto(id, datosParaActualizar) {
        try {
            const producto = await Producto.findByPk(id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            await producto.update(datosParaActualizar);
            return {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                stock: producto.stock,
                ...datosParaActualizar,
            };
        } catch (error) {
            throw new Error('Error al actualizar el producto: ' + error.message);
        }
    }

    async eliminarProducto(id) {
        try {
            const producto = await Producto.findByPk(id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            await producto.destroy();
            return { message: 'Producto eliminado con éxito' };
        } catch (error) {
            throw new Error('Error al eliminar el producto: ' + error.message);
        }
    }
}

module.exports = new ProductoService();

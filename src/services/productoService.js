const Producto = require('../models/producto');

class ProductoService {
    async crearProducto(datosProducto) {
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
            return producto;
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

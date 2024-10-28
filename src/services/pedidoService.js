const { Pedido, PedidoProducto } = require('../models/pedido');
const Producto = require('../models/producto');

class PedidoService {
    async crearPedido(datosPedido) {
        const { fecha, estado, productos } = datosPedido;

        try {
            // Verificar si todos los productos existen
            const productosExistentes = await Producto.findAll({
                where: {
                    id: productos.map(p => p.id)
                }
            });

            if (productosExistentes.length !== productos.length) {
                throw new Error('Uno o más productos no existen en la base de datos.');
            }

            // Verificar que la cantidad solicitada no supere el stock disponible
            for (const producto of productos) {
                const productoDb = productosExistentes.find(p => p.id === producto.id);

                if (productoDb.stock < producto.cantidad) {
                    throw new Error(`El producto "${productoDb.nombre}" no tiene suficiente stock. Stock disponible: ${productoDb.stock}, Cantidad solicitada: ${producto.cantidad}`);
                }
            }

            // Calcular el precio total
            const precioTotal = productosExistentes.reduce((total, producto) => {
                const cantidad = productos.find(p => p.id === producto.id).cantidad;
                return total + (producto.precio * cantidad);
            }, 0);

            // Crear el pedido principal
            const nuevoPedido = await Pedido.create({
                fecha,
                estado,
                precioTotal
            });

            // Asociar productos al pedido con sus cantidades en la tabla intermedia
            await Promise.all(
                productos.map(async (producto) => {
                    await PedidoProducto.create({
                        pedidoId: nuevoPedido.id,
                        productoId: producto.id,
                        cantidad: producto.cantidad
                    });

                    // Actualizar la cantidad de cada producto en la base de datos
                    const productoDb = productosExistentes.find(p => p.id === producto.id);
                    await productoDb.update({
                        stock: productoDb.stock - producto.cantidad
                    });
                })
            );

            // Retornar el pedido creado junto con los productos asociados
            return nuevoPedido;
        } catch (error) {
            console.error("Error al crear el pedido:", error); // Imprimir error en la consola
            throw new Error('Error al crear el pedido: ' + error.message); // Lanzar un error con un mensaje más claro
        }

    }

    async obtenerPedidos() {
        try {
            return await Pedido.findAll({
                include: {
                    model: Producto,
                    through: {
                        attributes: ['cantidad'] // Solo traer el campo `cantidad` de la tabla intermedia
                    }
                }
            });
        } catch (error) {
            console.error("Error al obtener los pedidos:", error);
            throw new Error('Error al obtener los pedidos: ' + error.message);
        }
    }

    async obtenerPedidoPorId(id) {
        try {
            const pedido = await Pedido.findByPk(id, {
                include: {
                    model: Producto,
                    through: {
                        attributes: ['cantidad']
                    }
                }
            });

            if (!pedido) {
                throw new Error('Pedido no encontrado.');
            }

            return pedido;
        } catch (error) {
            console.error("Error al obtener el pedido:", error);
            throw new Error('Error al obtener el pedido: ' + error.message);
        }
    }

    async actualizarEstadoPedido(id, estado) {
        try {
            const [updatedCount, updatedRows] = await Pedido.update(
                { estado },
                { where: { id }, returning: true } // `returning: true` permite obtener el pedido actualizado
            );

            if (updatedCount === 0) {
                throw new Error('Pedido no encontrado.');
            }

            return updatedRows[0];
        } catch (error) {
            console.error("Error al actualizar el estado del pedido:", error);
            throw new Error('Error al actualizar el estado del pedido: ' + error.message);
        }
    }

    async eliminarPedido(id) {
        try {
            const deletedCount = await Pedido.destroy({
                where: { id }
            });

            if (deletedCount === 0) {
                throw new Error('Pedido no encontrado.');
            }

            return { mensaje: 'Pedido eliminado con éxito.' };
        } catch (error) {
            console.error("Error al eliminar el pedido:", error);
            throw new Error('Error al eliminar el pedido: ' + error.message);
        }
    }
}

module.exports = new PedidoService();

const { Pedido, ProductoPedido } = require('../models/pedido');
const Producto = require('../models/producto');
const { Op } = require('sequelize');

class PedidoService {
    async crearPedido(datosPedido) {
        const { fecha, productos, tipo } = datosPedido;

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
            if (tipo === 'entrante') {
                for (const producto of productos) {
                    const productoDb = productosExistentes.find(p => p.id === producto.id);

                    if (productoDb.stock < producto.cantidad) {
                        throw new Error(`El producto "${productoDb.nombre}" no tiene suficiente stock. Stock disponible: ${productoDb.stock}, Cantidad solicitada: ${producto.cantidad}`);
                    }
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
                precioTotal,
                tipo
            });

            // Asociar productos al pedido con sus cantidades en la tabla intermedia
            await Promise.all(
                productos.map(async (producto) => {
                    await ProductoPedido.create({
                        pedidoId: nuevoPedido.id,
                        productoId: producto.id,
                        cantidad: producto.cantidad
                    });

                    // Actualizar stock según el tipo de pedido
                    const productoDb = productosExistentes.find(p => p.id === producto.id);
                    const stockNuevo =
                        tipo === 'entrante'
                            ? productoDb.stock - producto.cantidad
                            : productoDb.stock + producto.cantidad;

                    await productoDb.update({ stock: stockNuevo });
                })
            );

            // Retornar el pedido creado junto con los productos asociados
            return nuevoPedido;
        } catch (error) {
            throw new Error('Error al crear el pedido: ' + error.message);
        }

    }

    async obtenerPedidos(tipo) {
        try {
            const filtros = tipo ? { tipo: { [Op.eq]: tipo } } : {}; // Si se proporciona un tipo, se filtra; de lo contrario, no aplica filtro
            return await Pedido.findAll({
                where: filtros,
                include: {
                    model: Producto,
                    through: {
                        attributes: ['cantidad']
                    }
                }
            });
        } catch (error) {
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
            throw new Error('Error al obtener el pedido: ' + error.message);
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
            throw new Error('Error al eliminar el pedido: ' + error.message);
        }
    }

    async actualizarPedido(id, datosPedido) {
        const { productos, tipo } = datosPedido;

        try {
            // Encontrar el pedido
            const pedido = await Pedido.findByPk(id, {
                include: {
                    model: Producto,
                    through: { attributes: ['cantidad'] }
                }
            });

            if (!pedido) {
                throw new Error('Pedido no encontrado.');
            }

            // Revertir el stock de productos del pedido actual
            for (const ProductoPedido of pedido.Productos) {
                const productoDb = await Producto.findByPk(ProductoPedido.id);
                const stockNuevo =
                    pedido.tipo === 'entrante'
                        ? productoDb.stock + ProductoPedido.ProductoPedido.cantidad
                        : productoDb.stock - ProductoPedido.ProductoPedido.cantidad;

                await productoDb.update({ stock: stockNuevo });
            }

            // Verificar el stock y actualizar las cantidades
            if (tipo === 'entrante') {
                for (const producto of productos) {
                    const productoDb = await Producto.findByPk(producto.id);

                    if (!productoDb) {
                        throw new Error(`Producto con ID ${producto.id} no encontrado.`);
                    }

                    if (productoDb.stock < producto.cantidad) {
                        throw new Error(`El producto "${productoDb.id}" no tiene suficiente stock.`);
                    }
                }
            }

            // Actualizar el pedido con los nuevos productos
            await ProductoPedido.destroy({ where: { pedidoId: id } });

            const nuevoTotal = await Promise.all(
                productos.map(async (producto) => {
                    await ProductoPedido.create({
                        pedidoId: pedido.id,
                        productoId: producto.id,
                        cantidad: producto.cantidad
                    });

                    const productoDb = await Producto.findByPk(producto.id);
                    const stockNuevo =
                        tipo === 'entrante'
                            ? productoDb.stock - producto.cantidad
                            : productoDb.stock + producto.cantidad;

                    await productoDb.update({ stock: stockNuevo });

                    return productoDb.precio * producto.cantidad;
                })
            ).then((totales) => totales.reduce((acc, val) => acc + val, 0));

            // Guardar el total del pedido actualizado
            await pedido.update({ precioTotal: nuevoTotal, tipo });

            // Retornar el pedido actualizado
            return await this.obtenerPedidoPorId(id);
        } catch (error) {
            throw new Error('Error al actualizar el pedido: ' + error.message);
        }
    }

    async devolverStock(id) {
        try {
            // Encontrar el pedido con los productos asociados
            const pedido = await Pedido.findByPk(id, {
                include: {
                    model: Producto,
                    through: { attributes: ['cantidad'] }
                }
            });

            if (!pedido) {
                throw new Error('Pedido no encontrado.');
            }

            // Restaurar el stock de cada producto del pedido
            for (const ProductoPedido of pedido.Productos) {
                const productoDb = await Producto.findByPk(ProductoPedido.id);
                const stockNuevo = productoDb.stock + ProductoPedido.ProductoPedido.cantidad;
                await productoDb.update({ stock: stockNuevo });
            }

            return { mensaje: 'Stock devuelto y pedido eliminado con éxito.' };
        } catch (error) {
            throw new Error('Error al devolver el stock: ' + error.message);
        }
    }


}

module.exports = new PedidoService();

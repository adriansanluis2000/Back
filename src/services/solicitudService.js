const { Solicitud, ProductoSolicitud } = require('../models/solicitud');
const Producto = require('../models/producto');

const crearSolicitud = async (productos) => {
    try {
        // Verificar si todos los productos existen
        const productosExistentes = await Producto.findAll({
            where: {
                id: productos.map(p => p.id)
            }
        });

        if (!productosExistentes) {
            throw new Error('Uno o más productos no existen en la base de datos.');
        }

        // Crear la solicitud de pedido
        const nuevaSolicitud = await Solicitud.create({
            fecha: new Date(),
        });

        // Asociar productos al pedido con sus cantidades en la tabla intermedia
        await Promise.all(
            productos.map(async (producto) => {
                await ProductoSolicitud.create({
                    solicitudId: nuevaSolicitud.id,
                    productoId: producto.id,
                    cantidad: producto.cantidad
                });
            })
        );

        return nuevaSolicitud;
    } catch (error) {
        throw new Error(error.message);
    }
};

const obtenerSolicitudesPendientes = async () => {
    try {
        return await Solicitud.findAll({
            include: {
                model: Producto,
                through: {
                    attributes: ['cantidad']
                }
            }
        });
    } catch (error) {
        throw new Error('Error al obtener las solicitudes de pedido');
    }
};

const eliminarSolicitud = async (id) => {
    try {
        const solicitud = await Solicitud.findByPk(id);

        if (!solicitud) {
            throw new Error('Solicitud de pedido no encontrada');
        }

        await solicitud.destroy();
        return { message: 'Solicitud eliminada correctamente' };
    } catch (error) {
        throw new Error(error.message);
    }
};

const actualizarSolicitud = async (solicitudId, productos) => {
    try {
        // Verificar si la solicitud existe
        const solicitud = await Solicitud.findByPk(solicitudId, {
            include: {
                model: Producto,
                through: { attributes: ['cantidad'] }
            }
        });

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        // Procesar cada producto recibido
        for (const producto of productos) {
            const { id, cantidad } = producto;

            // Buscar la relación ProductoSolicitud
            const productoSolicitud = await ProductoSolicitud.findOne({
                where: { solicitudId, productoId: id }
            })

            if (!productoSolicitud) {
                throw new Error(`El producto con ID ${id} no está en la solicitud.`);
            }

            // Restar la cantidad recibida de la solicitud
            const nuevaCantidad = productoSolicitud.cantidad - cantidad;

            if (nuevaCantidad > 0) {
                // Si aún quedan unidades, actualizar la cantidad en la tabla intermedia
                await productoSolicitud.update({ cantidad: nuevaCantidad })
            } else {
                // Si la cantidad llega a 0, eliminar la relación del producto con la solicitud
                await productoSolicitud.destroy();
            }

            // Aumentar el stock del producto en el almacén
            const productoAlmacen = await Producto.findByPk(id);
            if (productoAlmacen) {
                await productoAlmacen.update({ stock: productoAlmacen.stock + cantidad });
            }
        }

        // Verificar si la solicitud aún tiene productos asociados
        const productosRestantes = await ProductoSolicitud.findAll({ where: { solicitudId } });

        if (productosRestantes.length === 0) {
            // Si ya no tiene productos, eliminar la solicitud
            await solicitud.destroy();
            return { mensaje: 'Solicitud eliminada porque ya no tiene productos.' };
        }

        return { mensaje: 'Solicitud actualizada correctamente.' };
    } catch (error) {
        throw new Error('Error al actualizar la solicitud: ' + error.message);
    }
};


module.exports = {
    crearSolicitud,
    obtenerSolicitudesPendientes,
    eliminarSolicitud,
    actualizarSolicitud
};

const { ValidationError } = require('sequelize');
const productoService = require('../services/productoService');

exports.crear = async (req, res) => {
    try {
        const producto = await productoService.crearProducto(req.body);
        res.status(201).json(producto);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({
                message: "Validación fallida",
                errors: error.errors
            });
        }
        res.status(404).json({
            message: "Error al procesar la solicitud",
            error: error.message
        });
    }
};

exports.listar = async (req, res) => {
    try {
        const productos = await productoService.obtenerTodosLosProductos();
        res.status(200).json(productos);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const producto = await productoService.obtenerProductoPorId(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(producto);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

exports.actualizar = async (req, res) => {
    try {
        const productoActualizado = await productoService.actualizarProducto(req.params.id, req.body);
        res.status(200).json(productoActualizado);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

exports.eliminar = async (req, res) => {
    try {
        await productoService.eliminarProducto(req.params.id);
        res.status(200).json({ message: 'Producto eliminado con éxito' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
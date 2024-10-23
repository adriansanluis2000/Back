const productoService = require('../services/productoService');

exports.crear = async (req, res) => {
    try {
        const { nombre, precio, stock } = req.body;

        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ message: "El nombre es requerido y debe ser una cadena de texto válida" });
        }

        if (!precio || typeof precio !== 'number' || precio <= 0) {
            return res.status(400).json({ message: "El precio es requerido y debe ser un número positivo" });
        }

        if (!stock || typeof stock !== 'number' || stock <= 0) {
            return res.status(400).json({ message: "La cantidad es requerida y debe ser un número positivo" });
        }

        const producto = await productoService.crearProducto(req.body);
        res.status(201).json(producto);

    } catch (error) {
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
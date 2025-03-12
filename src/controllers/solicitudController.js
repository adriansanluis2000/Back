const solicitudService = require('../services/solicitudService');

const crearSolicitud = async (req, res) => {
    try {
        const solicitud = await solicitudService.crearSolicitud(req.body);
        res.status(201).json(solicitud);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const obtenerSolicitudesPendientes = async (req, res) => {
    try {
        const solicitudes = await solicitudService.obtenerSolicitudesPendientes();
        res.status(200).json(solicitudes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarSolicitud = async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await solicitudService.eliminarSolicitud(id);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const actualizarSolicitud = async (req, res) => {
    const solicitudId = req.params.id;
    const productos = req.body;

    try {
        const solicitudActualizada = await solicitudService.actualizarSolicitud(solicitudId, productos);
        res.status(200).json(solicitudActualizada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    crearSolicitud,
    obtenerSolicitudesPendientes,
    eliminarSolicitud,
    actualizarSolicitud
};

const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');

// Crear una solicitud
router.post('/', solicitudController.crearSolicitud);

// Obtener las solicitudes pendientes
router.get('/', solicitudController.obtenerSolicitudesPendientes);

// Eliminar una solicitud
router.delete('/:id', solicitudController.eliminarSolicitud);

// Actualizar una solicitud
router.put('/:id', solicitudController.actualizarSolicitud);

module.exports = router;

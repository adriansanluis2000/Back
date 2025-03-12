const solicitudController = require("../controllers/solicitudController");
const solicitudService = require("../services/solicitudService");

jest.mock("../services/solicitudService");

describe("SolicitudController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("crearSolicitud", () => {
    it("debería crear una solicitud y devolver el resultado", async () => {
      const solicitudData = { nombre: "Solicitud Test" };
      const solicitudCreada = { id: 1, ...solicitudData };
      req.body = solicitudData;

      solicitudService.crearSolicitud.mockResolvedValue(solicitudCreada);

      await solicitudController.crearSolicitud(req, res);

      expect(solicitudService.crearSolicitud).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(solicitudCreada);
    });

    it("debería manejar los errores al crear una solicitud", async () => {
      const error = new Error("Error al crear solicitud");
      req.body = { nombre: "Solicitud Test" };

      solicitudService.crearSolicitud.mockRejectedValue(error);

      await solicitudController.crearSolicitud(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("obtenerSolicitudesPendientes", () => {
    it("debería obtener las solicitudes pendientes y devolverlas", async () => {
      const solicitudesPendientes = [
        { id: 1, nombre: "Solicitud 1" },
        { id: 2, nombre: "Solicitud 2" },
      ];

      solicitudService.obtenerSolicitudesPendientes.mockResolvedValue(
        solicitudesPendientes
      );

      await solicitudController.obtenerSolicitudesPendientes(req, res);

      expect(solicitudService.obtenerSolicitudesPendientes).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(solicitudesPendientes);
    });

    it("debería manejar los errores al obtener solicitudes pendientes", async () => {
      const error = new Error("Error al obtener solicitudes");

      solicitudService.obtenerSolicitudesPendientes.mockRejectedValue(error);

      await solicitudController.obtenerSolicitudesPendientes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("eliminarSolicitud", () => {
    it("debería eliminar una solicitud y devolver el resultado", async () => {
      req.params = { id: "1" };
      const resultado = { mensaje: "Solicitud eliminada correctamente" };

      solicitudService.eliminarSolicitud.mockResolvedValue(resultado);

      await solicitudController.eliminarSolicitud(req, res);

      expect(solicitudService.eliminarSolicitud).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(resultado);
    });

    it("debería manejar los errores al eliminar una solicitud", async () => {
      req.params = { id: "1" };
      const error = new Error("Error al eliminar solicitud");

      solicitudService.eliminarSolicitud.mockRejectedValue(error);

      await solicitudController.eliminarSolicitud(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("actualizarSolicitud", () => {
    it("debería actualizar una solicitud y devolver el resultado", async () => {
      req.params = { id: "1" };
      req.body = [{ productoId: 1, cantidad: 2 }];
      const solicitudActualizada = { id: "1", productos: req.body };

      solicitudService.actualizarSolicitud.mockResolvedValue(
        solicitudActualizada
      );

      await solicitudController.actualizarSolicitud(req, res);

      expect(solicitudService.actualizarSolicitud).toHaveBeenCalledWith(
        "1",
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(solicitudActualizada);
    });

    it("debería manejar los errores al actualizar una solicitud", async () => {
      req.params = { id: "1" };
      req.body = [{ productoId: 1, cantidad: 2 }];
      const error = new Error("Error al actualizar solicitud");

      solicitudService.actualizarSolicitud.mockRejectedValue(error);

      await solicitudController.actualizarSolicitud(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});

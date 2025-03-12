const SolicitudService = require("../services/solicitudService");
const { Solicitud, ProductoSolicitud } = require("../models/solicitud");
const Producto = require("../models/producto");

jest.mock("../models/solicitud", () => ({
  Solicitud: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  ProductoSolicitud: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock("../models/producto", () => {
  return {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    belongsToMany: jest.fn(),
    update: jest.fn(),
  };
});

describe("SolicitudService", () => {
  describe("crearSolicitud", () => {
    it("debería crear una solicitud de pedido con productos válidos", async () => {
      const productos = [
        { id: 1, cantidad: 2 },
        { id: 2, cantidad: 3 },
      ];
      const productosExistentes = [{ id: 1 }, { id: 2 }];
      const nuevaSolicitud = { id: 1, fecha: new Date() };

      Producto.findAll.mockResolvedValue(productosExistentes);
      Solicitud.create.mockResolvedValue(nuevaSolicitud);
      ProductoSolicitud.create.mockResolvedValue({});

      const result = await SolicitudService.crearSolicitud(productos);

      expect(Producto.findAll).toHaveBeenCalledWith({
        where: { id: [1, 2] },
      });
      expect(Solicitud.create).toHaveBeenCalled();
      expect(ProductoSolicitud.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual(nuevaSolicitud);
    });

    it("debería lanzar un error si uno o más productos no existen", async () => {
      const productos = [
        { id: 1, cantidad: 2 },
        { id: 3, cantidad: 1 },
      ];
      const productosExistentes = [{ id: 1 }];

      Producto.findAll.mockResolvedValue(productosExistentes); // Solo producto 1 existe

      // Esperamos que la función cree una solicitud, pero lance un error porque el producto 3 no existe
      await expect(SolicitudService.crearSolicitud(productos)).rejects.toThrow(
        "Uno o más productos no existen en la base de datos."
      );
    });
  });

  describe("obtenerSolicitudesPendientes", () => {
    it("debería devolver todas las solicitudes de pedido con productos asociados", async () => {
      const solicitudes = [
        { id: 1, fecha: new Date(), productos: [{ id: 1, cantidad: 2 }] },
        { id: 2, fecha: new Date(), productos: [{ id: 2, cantidad: 3 }] },
      ];

      Solicitud.findAll.mockResolvedValue(solicitudes);

      const result = await SolicitudService.obtenerSolicitudesPendientes();

      expect(Solicitud.findAll).toHaveBeenCalled();
      expect(result).toEqual(solicitudes);
    });

    it("debería lanzar un error si ocurre un problema al obtener las solicitudes", async () => {
      Solicitud.findAll.mockRejectedValue(
        new Error("Error al obtener las solicitudes de pedido")
      );

      await expect(
        SolicitudService.obtenerSolicitudesPendientes()
      ).rejects.toThrow("Error al obtener las solicitudes de pedido");
    });
  });

  describe("eliminarSolicitud", () => {
    it("debería eliminar una solicitud y devolver un mensaje", async () => {
      const solicitud = { id: 1, destroy: jest.fn() };
      Solicitud.findByPk.mockResolvedValue(solicitud);

      const result = await SolicitudService.eliminarSolicitud(1);

      expect(Solicitud.findByPk).toHaveBeenCalledWith(1);
      expect(solicitud.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: "Solicitud eliminada correctamente" });
    });

    it("debería lanzar un error si la solicitud no se encuentra", async () => {
      Solicitud.findByPk.mockResolvedValue(null);

      await expect(SolicitudService.eliminarSolicitud(999)).rejects.toThrow(
        "Solicitud de pedido no encontrada"
      );
    });
  });

  describe("actualizarSolicitud", () => {
    it("debería actualizar la solicitud correctamente", async () => {
      const productos = [{ id: 1, cantidad: 1 }];
      const solicitud = {
        id: 1,
        productos: [{ id: 1, cantidad: 2 }],
        destroy: jest.fn(),
      };
      const productoSolicitud = {
        cantidad: 2,
        update: jest.fn(),
        destroy: jest.fn(),
      };
      const productoAlmacen = { id: 1, stock: 10, update: jest.fn() };

      Solicitud.findByPk.mockResolvedValue(solicitud);
      ProductoSolicitud.findOne.mockResolvedValue(productoSolicitud);
      Producto.findByPk.mockResolvedValue(productoAlmacen);

      const result = await SolicitudService.actualizarSolicitud(1, productos);

      expect(Solicitud.findByPk).toHaveBeenCalledWith(1, {
        include: expect.anything(),
      });
      expect(ProductoSolicitud.findOne).toHaveBeenCalledWith({
        where: { solicitudId: 1, productoId: 1 },
      });
      expect(productoSolicitud.update).toHaveBeenCalledWith({ cantidad: 1 });
      expect(productoAlmacen.update).toHaveBeenCalledWith({ stock: 11 });
      expect(result).toEqual({
        mensaje: "Solicitud actualizada correctamente.",
      });
    });

    it("debería eliminar la solicitud si ya no tiene productos asociados", async () => {
      const productos = [{ id: 1, cantidad: 2 }];
      const solicitud = {
        id: 1,
        productos: [{ id: 1, cantidad: 2 }],
        destroy: jest.fn(),
      };
      const productoSolicitud = { cantidad: 2, destroy: jest.fn() };

      Solicitud.findByPk.mockResolvedValue(solicitud);
      ProductoSolicitud.findOne.mockResolvedValue(productoSolicitud);
      Producto.findByPk.mockResolvedValue({
        id: 1,
        stock: 10,
        update: jest.fn(),
      });

      ProductoSolicitud.findAll.mockResolvedValue([]);

      const result = await SolicitudService.actualizarSolicitud(1, productos);

      expect(solicitud.destroy).toHaveBeenCalled();
      expect(result).toEqual({
        mensaje: "Solicitud eliminada porque ya no tiene productos.",
      });
    });

    it("debería lanzar un error si la solicitud no existe", async () => {
      Solicitud.findByPk.mockResolvedValue(null);

      await expect(
        SolicitudService.actualizarSolicitud(999, [])
      ).rejects.toThrow("Solicitud no encontrada");
    });

    it("debería lanzar un error si el producto no está en la solicitud", async () => {
      const productos = [{ id: 1, cantidad: 1 }];
      const solicitud = {
        id: 1,
        productos: [{ id: 2, cantidad: 2 }],
        destroy: jest.fn(),
      };

      Solicitud.findByPk.mockResolvedValue(solicitud);
      ProductoSolicitud.findOne.mockResolvedValue(null);

      await expect(
        SolicitudService.actualizarSolicitud(1, productos)
      ).rejects.toThrow("El producto con ID 1 no está en la solicitud.");
    });

    it("debería lanzar un error si el producto no existe en el almacén", async () => {
      const productos = [{ id: 1, cantidad: 1 }];
      const solicitud = {
        id: 1,
        productos: [{ id: 1, cantidad: 2 }],
        destroy: jest.fn(),
      };
      const productoSolicitud = {
        cantidad: 2,
        update: jest.fn(),
        destroy: jest.fn(),
      };

      // Simulando que no existe el producto en el almacén (Producto.findByPk devuelve null)
      Solicitud.findByPk.mockResolvedValue(solicitud);
      ProductoSolicitud.findOne.mockResolvedValue(productoSolicitud);
      Producto.findByPk.mockResolvedValue(null); // Producto no encontrado

      // Esperamos que se lance un error porque el producto no existe
      await expect(
        SolicitudService.actualizarSolicitud(1, productos)
      ).rejects.toThrow("Producto con ID 1 no encontrado en el almacén.");
    });
  });
});

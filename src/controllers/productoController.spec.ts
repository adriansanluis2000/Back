const Productoo = require('../models/producto');
const productoService = require('../services/productoService');
const productoController = require('../controllers/productoController');

jest.mock('../services/productoService', () => ({
  crearProducto: jest.fn(),
  obtenerTodosLosProductos: jest.fn(),
  obtenerProductoPorId: jest.fn(),
  actualizarProducto: jest.fn(),
  eliminarProducto: jest.fn()
}));

describe('crear', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('debería devolver 400 si falta el nombre', async () => {
    req.body = { precio: 100, categoria: 10 };

    await productoController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "El nombre es requerido y debe ser una cadena de texto válida" });
  });

  test('debería devolver 400 si el precio no es válido', async () => {
    req.body = { nombre: 'Gafas de sol', precio: -10, stock: 10 };

    await productoController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "El precio es requerido y debe ser un número positivo" });
  });

  test('debería devolver 400 si falta la categoría', async () => {
    req.body = { nombre: 'Gafas de sol', precio: 100 };

    await productoController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "La cantidad es requerida y debe ser un número positivo" });
  });

  test('debería devolver un error si el umbral es mayor que el stock disponible', async () => {
    req.body = { nombre: 'Gafas de sol', precio: 100, stock: 10, umbral: 20 };

    await productoController.crear(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: "El umbral no puede ser mayor que el stock disponible" });
  });

  test('debería crear un producto exitosamente y devolver status 201', async () => {
    req.body = { id: 1, nombre: 'Product 1', precio: 20, stock: 10 };
    const mockProducto = { id: 1, ...req.body };

    jest.spyOn(productoService, 'crearProducto').mockResolvedValue(mockProducto);

    await productoController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockProducto);
  });

  test('debería devolver un error 404 para otros errores', async () => {
    req.body = { nombre: 'Gafas de sol', precio: 100, stock: 10 };

    // Simula un error en el servicio
    const error = new Error('Error de base de datos');
    jest.spyOn(productoService, 'crearProducto').mockRejectedValue(error);

    await productoController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al procesar la solicitud",
      error: error.message
    });
  });
});

describe('listar', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Debería devolver una lista de productos cuando se recuperen correctamente', async () => {
    const productos = [{ id: 1, nombre: 'Product 1' }, { id: 2, nombre: 'Product 2' }];
    productoService.obtenerTodosLosProductos.mockResolvedValueOnce(productos);

    await productoController.listar(req, res);

    expect(productoService.obtenerTodosLosProductos).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(productos);
  });

  test('Debería devolver un status 404 y un mensaje de error cuando ocurra un error', async () => {
    const errorMessage = 'Error retrieving products';
    productoService.obtenerTodosLosProductos.mockRejectedValueOnce(new Error(errorMessage));

    await productoController.listar(req, res);

    expect(productoService.obtenerTodosLosProductos).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe('obtenerPorId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Debería devolver el producto cuando exista', async () => {
    const mockProduct = { id: 1, nombre: 'Product 1' };
    productoService.obtenerProductoPorId.mockResolvedValue(mockProduct);

    const req = { params: { id: 1 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await productoController.obtenerPorId(req, res);

    expect(productoService.obtenerProductoPorId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProduct);
  });

  test('Debería devolver un estado 404 y un mensaje de error cuando el producto no exista', async () => {
    productoService.obtenerProductoPorId.mockResolvedValue(null);

    const req = { params: { id: 1 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await productoController.obtenerPorId(req, res);

    expect(productoService.obtenerProductoPorId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
  });

  test('Debería devolver un estado 404 y un mensaje de error cuando ocurra un error', async () => {
    const errorMessage = 'Internal server error';
    productoService.obtenerProductoPorId.mockRejectedValue(new Error(errorMessage));

    const req = { params: { id: 1 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await productoController.obtenerPorId(req, res);

    expect(productoService.obtenerProductoPorId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe('actualizar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debería actualizar el producto y devolver el producto actualizado', async () => {
    const req = {
      params: { id: '123' },
      body: { nombre: 'New Product' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const updatedProduct = { id: '123', nombre: 'New Product' };
    productoService.actualizarProducto.mockResolvedValue(updatedProduct);

    await productoController.actualizar(req, res);

    expect(productoService.actualizarProducto).toHaveBeenCalledWith('123', { nombre: 'New Product' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedProduct);
  });

  test('Debería manejar los errores y devolver un estado 404 con un mensaje de error', async () => {
    const req = {
      params: { id: '123' },
      body: { nombre: 'New Product' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'Product not found';
    productoService.actualizarProducto.mockRejectedValue(new Error(errorMessage));

    await productoController.actualizar(req, res);

    expect(productoService.actualizarProducto).toHaveBeenCalledWith('123', { nombre: 'New Product' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe('eliminar', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: { id: '123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Debería eliminar el producto y devolver un mensaje de éxito', async () => {
    await productoController.eliminar(req, res);

    expect(productoService.eliminarProducto).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Producto eliminado con éxito' });
  });

  test('Debería manejar el error y devolver un mensaje de error', async () => {
    const errorMessage = 'Product not found';
    productoService.eliminarProducto.mockRejectedValueOnce(new Error(errorMessage));

    await productoController.eliminar(req, res);

    expect(productoService.eliminarProducto).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});
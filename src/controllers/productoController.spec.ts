const Productoo = require('../models/producto');
const productoService = require('../services/productoService');
const productoController = require('../controllers/productoController');
const { ValidationError } = require('sequelize');

beforeEach(async () => {
  await Productoo.destroy({ where: {} });
});

jest.mock('../services/productoService', () => ({
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

  test('should create a product and return it with status 201', async () => {
    const producto = { id: 1, name: 'Product 1' };
    productoService.crearProducto = jest.fn().mockResolvedValue(producto);

    await productoController.crear(req, res);

    expect(productoService.crearProducto).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(producto);
  });

  test('should handle validation error and return status 400 with error details', async () => {
    const validationError = new ValidationError('Validation failed', { errors: ['error1', 'error2'] });
    productoService.crearProducto = jest.fn().mockRejectedValue(validationError);

    await productoController.crear(req, res);

    expect(productoService.crearProducto).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validación fallida',
      errors: validationError.errors,
    });
  });

  test('should handle other errors and return status 404 with error message', async () => {
    const errorMessage = 'Some error message';
    productoService.crearProducto = jest.fn().mockRejectedValue(new Error(errorMessage));

    await productoController.crear(req, res);

    expect(productoService.crearProducto).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error al procesar la solicitud',
      error: errorMessage,
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

  test('should return a list of products when successfully retrieved', async () => {
    const productos = [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }];
    productoService.obtenerTodosLosProductos.mockResolvedValueOnce(productos);

    await productoController.listar(req, res);

    expect(productoService.obtenerTodosLosProductos).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(productos);
  });

  test('should return a 404 status and an error message when an error occurs', async () => {
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

  test('should return the product when it exists', async () => {
    const mockProduct = { id: 1, name: 'Product 1' };
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

  test('should return a 404 status and error message when the product does not exist', async () => {
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

  test('should return a 404 status and error message when an error occurs', async () => {
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

  test('should update the product and return the updated product', async () => {
    const req = {
      params: { id: '123' },
      body: { name: 'New Product' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const updatedProduct = { id: '123', name: 'New Product' };
    productoService.actualizarProducto.mockResolvedValue(updatedProduct);

    await productoController.actualizar(req, res);

    expect(productoService.actualizarProducto).toHaveBeenCalledWith('123', { name: 'New Product' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedProduct);
  });

  test('should handle errors and return a 404 status with an error message', async () => {
    const req = {
      params: { id: '123' },
      body: { name: 'New Product' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'Product not found';
    productoService.actualizarProducto.mockRejectedValue(new Error(errorMessage));

    await productoController.actualizar(req, res);

    expect(productoService.actualizarProducto).toHaveBeenCalledWith('123', { name: 'New Product' });
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

  test('should delete the product and return success message', async () => {
    await productoController.eliminar(req, res);

    expect(productoService.eliminarProducto).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Producto eliminado con éxito' });
  });

  test('should handle error and return error message', async () => {
    const errorMessage = 'Product not found';
    productoService.eliminarProducto.mockRejectedValueOnce(new Error(errorMessage));

    await productoController.eliminar(req, res);

    expect(productoService.eliminarProducto).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});
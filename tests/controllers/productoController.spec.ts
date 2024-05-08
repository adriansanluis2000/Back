const productoController = require('../../src/controllers/productoController');
const productoServiceC = require('../../src/services/productoService');
jest.mock('../../src/services/productoService');

import { Request, Response } from 'express';

// Define los tipos para las funciones mock.
interface MockRequest extends Partial<Request> {
  body?: any;
  params?: any;
}

interface MockResponse extends Partial<Response> {
  status: jest.Mock<any, any>;
  json: jest.Mock<any, any>;
}

// Función para crear un mock de Request
const mockRequest = (body: any = {}, params: any = {}): MockRequest => ({
  body,
  params
});

// Mock para Response
const mockResponse = (): Response => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response;
  };

describe('Crear producto', () => {
    test('Crea un producto exitosamente', async () => {
        const req = mockRequest({ nombre: "Nuevo Producto", precio: 20 });
        const res = mockResponse();
        productoServiceC.crearProducto.mockResolvedValue(req.body);
    
        await productoController.crear(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(req.body);
    });
    
    test('Crear un producto falla por validación', async () => {
        const req = mockRequest({ nombre: "" }); // Envío un campo vacío
        const res = mockResponse();
        const errors = { name: 'SequelizeValidationError', errores: [{ path: 'nombre', message: 'Nombre es requerido' }] };
    
        productoServiceC.crearProducto.mockRejectedValue(errors);
        await productoController.crear(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Validación fallida",
            errors: { nombre: 'Nombre es requerido' }
        });
    });
    
})
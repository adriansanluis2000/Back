const app = require('../app');
const request = require('supertest')(app);


describe('POST /addItem', () => {
  it('Agrega un nuevo producto con todos los campos completos y valores válidos', (done) => {
    request.post('/addItem')
      .send({ nombre: 'Producto A', precio: 10, cantidad: 5 })
      .expect(302) // Verifica el estado de la respuesta
      .expect('Location', '/items') // Verifica la redirección
      .end(done);
  });
});


describe('POST /addItem', () => {
  it('Intenta agregar un nuevo producto con campos vacíos', (done) => {
    request
      .post('/addItem')
      .send({ nombre: '', precio: '', cantidad: '' })
      .expect(200) // Verifica el estado de la respuesta
      .expect(errors).toBe('Debes completar todos los campos requeridos') // Verifica el tipo de contenido de la respuesta
      .end(done);
  });
});


describe('POST /addItem', () => {
  it('Intenta agregar un nuevo producto con precio negativo', (done) => {
    request
      .post('/addItem')
      .send({ nombre: 'Producto B', precio: -5, cantidad: 10 })
      .expect(200) // Verifica el estado de la respuesta
      .expect('Content-Type', 'text/html; charset=utf-8') // Verifica el tipo de contenido de la respuesta
      .end(done);
  });
});

describe('POST /addItem', () => {
  it('Intenta agregar un nuevo producto con cantidad negativa', (done) => {
    request
      .post('/addItem')
      .send({ nombre: 'Producto B', precio: 20, cantidad: -10 })
      .expect(200) // Verifica el estado de la respuesta
      .expect('Content-Type', 'text/html; charset=utf-8') // Verifica el tipo de contenido de la respuesta
      .end(done);
  });
});

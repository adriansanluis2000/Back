const express = require('express');
const path = require('path');
//const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//const Schema = mongoose.Schema;

const app = express();
const mysql = require('mysql2');

module.exports = app;

// Conectar a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'stock',
})

// Establecer la conexión a la base de datos MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos MySQL');
  }
});

// Crea la tabla de productos
connection.query(`
  CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    precio DECIMAL(10, 2),
    cantidad INT
  )
`, (error, results) => {
  if (error) {
    console.error('Error al crear la tabla productos:', error);
  } else {
    console.log('Tabla productos creada con éxito');
  }
});


// Habilitar pug
app.set('view engine', 'pug');

// Carpeta para las vistas
app.set('views', path.join(__dirname, 'views'));

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));






/* 
// Conectar MongoDB
mongoose.connect('mongodb://127.0.0.1/stock_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const itemSchema = new Schema({
  nombre: String,
  precio: Number,
  cantidad: Number,
});
const Item = mongoose.model('Item', itemSchema); 
*/





async function getItems() {
  return new Promise((resolve, reject) => {
    const selectQuery = 'SELECT * FROM productos';

    connection.query(selectQuery, (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}



/*
 * Rutas de la aplicación
 */

app.get('/', (req, res) => {
  res.render('layout');
})


/*
 * Muestra la lista de productos registrados
 */
app.get('/items', (req, res) => {
  getItems()
    .then((foundItems) => {
      res.render('items', { items: foundItems });
    })
    .catch((error) => {
      console.error('Error al obtener los productos:', error);
      res.status(500).send('Error interno del servidor');
    });
});


/*
 * Obtiene la página para añadir un producto
 */
app.get('/addItem', (req, res) => {
  res.render('newItem');
});


/*
 * Registra un producto y lo almacena en la base de datos
 */
app.post('/addItem', (req, res) => {
  const { nombre, precio, cantidad } = req.body;

  const errors = [];

  // Validar que los campos no estén vacíos
  if (!nombre || !precio || !cantidad) {
    errors.push('Debes completar todos los campos requeridos');
    // Validar que el precio y la cantidad sean mayores a cero
  } else if (precio <= 0 || cantidad <= 0) {
    errors.push('El precio y la cantidad deben ser mayores que cero');
  }

  if (errors.length > 0) {
    res.render('newItem', { errors });
  } else {
    // Buscar un producto con el mismo nombre y precio que el que queremos añadir
    const nombreFinal = req.body.nombre.charAt(0).toUpperCase() + req.body.nombre.slice(1);
    const selectQuery = 'SELECT * FROM productos WHERE nombre = ? AND precio = ?';
    const selectValues = [nombreFinal, req.body.precio];

    connection.query(selectQuery, selectValues, (selectError, selectResults) => {
      if (selectError) {
        console.error('Error al consultar la base de datos:', selectError);
        res.redirect('/items');
      } else {
        if (selectResults.length > 0) {
          // Si encuentra un producto existente, incrementar la cantidad
          const existingItem = selectResults[0];
          const updateQuery = 'UPDATE productos SET cantidad = cantidad + ? WHERE id = ?';
          const updateValues = [parseInt(req.body.cantidad), existingItem.id];

          connection.query(updateQuery, updateValues, (updateError) => {
            if (updateError) {
              console.error('Error al actualizar el producto:', updateError);
            } else {
              console.log('Producto actualizado');
            }
            res.redirect('/items');
          });
        } else {
          // Si no encuentra un producto existente, crear uno nuevo
          const insertQuery = 'INSERT INTO productos (nombre, precio, cantidad) VALUES (?, ?, ?)';
          const insertValues = [nombreFinal, req.body.precio, req.body.cantidad];

          connection.query(insertQuery, insertValues, (insertError) => {
            if (insertError) {
              console.error('Error al insertar el producto:', insertError);
            } else {
              console.log('Producto insertado');
            }
            res.redirect('/items');
          });
        }
      }
    });
  }
});


/*
 * Elimina un producto de la base de datos
 */
app.get('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Item.findByIdAndDelete(id);
    res.redirect('/items');
  } catch (error) {
    res.status(500).send('Error al eliminar el item');
  }
});

app.get('/orders', (req, res) => {
  res.render('orders.pug');
});

app.get('/order-confirmed', (req, res) => {
  res.render('order-confirmed.pug');
});

app.post('/process-order', async (req, res) => {
  try {
    // Obtén los datos del formulario
    const { listaProductos } = req.body;

    // Verifica que se haya enviado la lista de productos
    if (!listaProductos || !Array.isArray(listaProductos)) {
      return res.status(400).send('Lista de productos inválida');
    }

    // Procesa cada producto de la lista
    for (const producto of listaProductos) {
      const { nombre, cantidad } = producto;

      // Busca el producto en la base de datos por su nombre
      const productoDB = await Item.findOne({ nombre });

      if (!productoDB) {
        return res.status(404).send('Producto no encontrado');
      }

      // Actualiza la cantidad del producto
      productoDB.cantidad -= cantidad;

      // Guarda los cambios en la base de datos
      await productoDB.save();
    }

    res.redirect('/order-confirmed');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar el pedido');
  }
});



// Cargar los archivos estáticos
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

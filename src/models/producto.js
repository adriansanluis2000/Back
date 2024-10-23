const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El nombre del producto es obligatorio'
      },
      notEmpty: {
        msg: 'El nombre del producto no puede estar vacío'
      },
    },
    unique: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El precio del producto es obligatorio'
      },
      isFloat: {
        msg: 'El precio debe ser un número válido'
      },
      min: {
        args: [0.01],
        msg: 'El precio mínimo debe ser al menos 0.01'
      }
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'La cantidad es obligatoria'
      },
      isInt: {
        msg: 'La cantidad debe ser un número entero'
      },
      min: {
        args: [1],
        msg: 'La cantidad mínima es 1'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  // Opciones del modelo
  timestamps: false, // Desactiva la generación automática de las columnas createdAt y updatedAt
});

module.exports = Producto;

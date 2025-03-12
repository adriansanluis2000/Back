const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Producto = require('./producto');

const Pedido = sequelize.define('Pedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    precioTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0.00],
                msg: 'El precio total debe ser al menos 0.00'
            }
        }
    },
    tipo: {
        type: DataTypes.ENUM('entrante', 'saliente'),
        allowNull: false
    }
}, {
    timestamps: false,
});

// Tabla intermedia para almacenar la cantidad de cada producto en el pedido
const ProductoPedido = sequelize.define('ProductoPedido', {
    cantidad: {
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
    }
}, {
    timestamps: false,
    tableName: 'productos_pedido'
});

// Relaciones
Pedido.belongsToMany(Producto, { through: ProductoPedido, foreignKey: 'pedidoId' });
Producto.belongsToMany(Pedido, { through: ProductoPedido, foreignKey: 'productoId' });

module.exports = { Pedido, ProductoPedido };

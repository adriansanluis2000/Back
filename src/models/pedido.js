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
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente',
        validate: {
            isIn: {
                args: [['pendiente', 'enviado', 'completado', 'cancelado']],
                msg: 'El estado debe ser uno de los valores permitidos'
            }
        }
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
    }
}, {
    timestamps: false,
});

// Tabla intermedia para almacenar la cantidad de cada producto en el pedido
const PedidoProducto = sequelize.define('PedidoProducto', {
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
});

// Relaciones
Pedido.belongsToMany(Producto, { through: PedidoProducto, foreignKey: 'pedidoId' });
Producto.belongsToMany(Pedido, { through: PedidoProducto, foreignKey: 'productoId' });

module.exports = { Pedido, PedidoProducto };

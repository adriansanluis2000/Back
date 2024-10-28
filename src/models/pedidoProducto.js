const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PedidoProducto = sequelize.define('PedidoProducto', {
    pedidoId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Pedidos', // nombre de la tabla referenciada
            key: 'id'
        },
        primaryKey: true // clave primaria para la tabla intermedia
    },
    productoId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Productos', // nombre de la tabla referenciada
            key: 'id'
        },
        primaryKey: true // clave primaria para la tabla intermedia
    },
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

module.exports = PedidoProducto;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Producto = require('./producto');

const Solicitud = sequelize.define('Solicitud', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: false,
    tableName: 'solicitudes'
});

const ProductoSolicitud = sequelize.define('ProductoSolicitud', {
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
    tableName: 'productos_solicitud'
})

Solicitud.belongsToMany(Producto, { through: ProductoSolicitud, foreignKey: 'solicitudId' });
Producto.belongsToMany(Solicitud, { through: ProductoSolicitud, foreignKey: 'productoId' });

module.exports = { Solicitud, ProductoSolicitud };

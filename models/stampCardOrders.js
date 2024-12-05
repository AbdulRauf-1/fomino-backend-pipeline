module.exports = (sequelize, DataTypes) =>{
    const stampCardOrders = sequelize.define('stampCardOrders', {
       
        value: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        endDate: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
         status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
    return stampCardOrders;
};
module.exports = (sequelize, DataTypes) =>{
    const driverRestaurantHours = sequelize.define('driverRestaurantHours', {
        startTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: true // Allow null initially, set when the order is delivered
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        }
    });
    return driverRestaurantHours;
};
module.exports = (sequelize, DataTypes) =>{
    const stampCardRestaurants = sequelize.define('stampCardRestaurants', {
       
        startDate: {
            type: DataTypes.DATE(),
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE(),
            allowNull: true,
        },
         status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
    return stampCardRestaurants;
};
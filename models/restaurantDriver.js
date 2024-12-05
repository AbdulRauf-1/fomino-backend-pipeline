module.exports = (sequelize, DataTypes) =>{
    const restaurantDriver = sequelize.define('restaurantDriver', {
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
       hourlyRate:{
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
    });
    restaurantDriver.associate = (models)=>{

    };
    
    return restaurantDriver;
};
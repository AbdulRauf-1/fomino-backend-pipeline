module.exports = (sequelize, DataTypes) =>{
    const restaurantOffers = sequelize.define('restaurantOffers', {
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
    restaurantOffers.associate = (models)=>{
        
    };
    return restaurantOffers;
};

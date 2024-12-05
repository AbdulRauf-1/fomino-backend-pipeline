module.exports = (sequelize, DataTypes) => {
    const freeDeliveryProducts = sequelize.define('freeDeliveryProducts', {
         status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
       
    });

    freeDeliveryProducts.associate = (models) => {
        
        
    };

    return freeDeliveryProducts;
};

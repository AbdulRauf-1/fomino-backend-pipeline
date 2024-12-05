module.exports = (sequelize, DataTypes) => {
    const discountProducts = sequelize.define('discountProducts', {
         status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
       
    });

    discountProducts.associate = (models) => {
        
    
    };

    return discountProducts;
};

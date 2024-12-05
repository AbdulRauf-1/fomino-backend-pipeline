module.exports = (sequelize, DataTypes) => {
    const excludeProducts = sequelize.define('excludeProducts', {
         status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
       
    });

    excludeProducts.associate = (models) => {
        
        
    };

    return excludeProducts;
};

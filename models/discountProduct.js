module.exports = (sequelize, DataTypes) => {
    const discountProducts = sequelize.define('discountProducts', {
         status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
       
    });

    discountProducts.associate = (models) => {
        
        discountProducts.hasMany(models.discountDetail);
        models.discountDetail.belongsTo(discountProducts);
        
        discountProducts.hasMany(models.R_PLink);
        models.R_PLink.belongsTo(discountProducts);
    };

    return discountProducts;
};

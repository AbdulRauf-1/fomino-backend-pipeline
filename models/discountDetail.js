module.exports = (sequelize, DataTypes) => {
    const discountDetail = sequelize.define('discountDetail', {
        
        discountType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        discountValue: {
            type: DataTypes.STRING,
            allowNull: true,
        },
       
        minimumOrderValue: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        capMaxDiscount: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
    });

    discountDetail.associate = (models) => {
               
        discountDetail.hasMany(models.discountProducts);
        models.discountProducts.belongsTo(discountDetail);
        
        discountDetail.hasMany(models.excludeProducts);
        models.excludeProducts.belongsTo(discountDetail);
    };

    return discountDetail;
};

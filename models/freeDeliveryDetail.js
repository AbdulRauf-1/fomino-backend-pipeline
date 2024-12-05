module.exports = (sequelize, DataTypes) => {
    const freeDeliveryDetail = sequelize.define('freeDeliveryDetail', {
       
        minimumOrderValue: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        radius: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        allProducts: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
       
    });

    freeDeliveryDetail.associate = (models) => {
        freeDeliveryDetail.hasMany(models.freeDeliveryProducts);
        models.freeDeliveryProducts.belongsTo(freeDeliveryDetail);
    };

    return freeDeliveryDetail;
};

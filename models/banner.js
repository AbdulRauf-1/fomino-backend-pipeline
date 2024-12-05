module.exports = (sequelize, DataTypes) =>{
    const banner = sequelize.define('banner', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        dimension: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        businessType: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
    banner.associate = (models)=>{
        
         banner.hasMany(models.restaurantOffers);
        models.restaurantOffers.belongsTo(banner);
    };
    return banner;
};

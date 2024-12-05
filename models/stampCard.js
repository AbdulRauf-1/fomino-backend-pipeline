module.exports = (sequelize, DataTypes) =>{
    const stampCard = sequelize.define('stampCard', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE(),
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE(),
            allowNull: true,
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
         status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
     stampCard.associate = (models)=>{
         
         stampCard.hasMany(models.stampCardRestaurants);
        models.stampCardRestaurants.belongsTo(stampCard);
        
         stampCard.hasMany(models.stampCardOrders);
        models.stampCardOrders.belongsTo(stampCard);
        
         stampCard.hasMany(models.stampCardPoints);
        models.stampCardPoints.belongsTo(stampCard);
        
    };
    return stampCard;
};
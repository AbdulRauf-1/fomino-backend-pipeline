module.exports = (sequelize, DataTypes) =>{
    const city = sequelize.define('city', {
        name: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        lat: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        lng: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
       
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
    city.associate = (models)=>{
         city.hasMany(models.areaCharges);
        models.areaCharges.belongsTo(city);
         city.hasOne(models.driverZone);
        models.driverZone.belongsTo(city);
         city.hasMany(models.zone);
        models.zone.belongsTo(city);
         city.hasMany(models.banner);
        models.banner.belongsTo(city);
        
         city.hasOne(models.stampCard);
        models.stampCard.belongsTo(city);
    };
    return city;
};

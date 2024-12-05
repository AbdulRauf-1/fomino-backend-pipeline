module.exports = (sequelize, DataTypes) =>{
    const collectionAddons = sequelize.define('collectionAddons', {
       minAllowed: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        maxAllowed: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
         isPaid:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        isAvaiable :{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        price :{
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
       
    });
    collectionAddons.associate = (models)=>{
        
        // collectionAddons.hasMany(models.orderAddOns);
        // models.orderAddOns.belongsTo(collectionAddons); 
    };
    return collectionAddons;
};
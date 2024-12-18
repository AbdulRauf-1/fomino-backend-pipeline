module.exports = (sequelize, DataTypes) =>{
    const productAddons = sequelize.define('productAddons', {
        
     
        status:{
            type: DataTypes.BOOLEAN,
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
       
    });
    productAddons.associate = (models)=>{
        
    };
    return productAddons;
};

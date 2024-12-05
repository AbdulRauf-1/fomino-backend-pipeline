module.exports = (sequelize, DataTypes) =>{
    const adminConfiguration = sequelize.define('adminConfiguration', {
       
       
      
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
    adminConfiguration.associate = (models)=>{
       
    };
    return adminConfiguration;
};

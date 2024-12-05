module.exports = (sequelize, DataTypes) =>{
    const menuCategoryLanguage = sequelize.define('menuCategoryLanguage', {
        language: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
      
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
    menuCategoryLanguage.associate = (models)=>{
       
    };
    
    return menuCategoryLanguage;
};
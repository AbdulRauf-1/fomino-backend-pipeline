const { Sequelize } = require('sequelize');

// Initialize Sequelize with your database credentials
const sequelizeForDb = new Sequelize('fomino_db', 'fomino_db', 'GnewP@ss4131', {
  host: 'localhost',
  dialect: 'mysql', // or 'postgres', 'sqlite', etc.
  logging: false, // Optional: Disable SQL query logging
});

// Test the connection
sequelizeForDb.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelizeForDb;

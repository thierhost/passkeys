const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');
const Challenge = sequelize.define('Challenge', {
  challenge: {
    type: DataTypes.STRING,
    primaryKey:true,
    allowNull:false
  }
});

Challenge
  .sync()
  .then(data => {
      console.log("Synced Challenge SQLite table");
  })
  .catch(error => {
      console.log(error);
  })

module.exports = Challenge;
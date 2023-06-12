const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');
const Challenge = sequelize.define('Challenge', {
  challenge: {
    type: DataTypes.STRING,
    primaryKey:true,
    allowNull:false
  }
});

/*
Challenge
.sync({ alter: true })
.then(data => {
    console.log("sync");
})
.catch(error => {
    console.log(error);
})
*/
module.exports = Challenge;
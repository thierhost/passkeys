const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  }, 
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

User
  .sync()
  .then(data => {
      console.log("Synced User SQLite table");
  })
  .catch(error => {
      console.log(error);
  })

module.exports = User;
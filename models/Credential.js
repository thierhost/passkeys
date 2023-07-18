const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require("./User");
const Credential = sequelize.define('Credential', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  }, 
  publicKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transport: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

User.hasMany(Credential);
Credential.belongsTo(User);

Credential
  .sync()
  .then(data => {
      console.log("Synced Credential SQLite table");
  })
  .catch(error => {
      console.log(error);
  })

module.exports = Credential;
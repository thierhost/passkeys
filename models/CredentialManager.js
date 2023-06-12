const Credential = require('./Credential');
const sequelize = require('sequelize');
const Op = sequelize.Op;
class CredentialManager {

    create = async (credential) => {
        return await Credential.create(credential);
    }

    get = async (id) => {
        return await Credential.findByPk(id);
    }

    getUserBy = async (params) => {
        return await Credential.findOne({where: params});
    }
    getAllCrentialsByUserId = async (userId) => {
        return await Credential.findAll({
            where: {
              UserId: {
                [Op.eq]: userId
              }
            }
          });
    }
    
    getUserAuthenticator = async (userId, credentialID) => {
      return await Credential.findOne({where: {
        "id":credentialID,
        "UserId": userId
      }});
    }
}

module.exports = new CredentialManager();
const Challenge = require('./Challenge');
const sequelize = require('sequelize');
class ChallengeManager {

    create = async (payload) => {
        return await Challenge.create(payload);
    }

    get = async (challenge) => {
        return await Challenge.findByPk(challenge);
    }

    getAll = async () => {
        return await Challenge.findAll();
    }
    remove = async (challenge) => {
        return await Challenge.destroy({
            where: {
              challenge: challenge
            }
          })
    }
}

module.exports = new ChallengeManager();
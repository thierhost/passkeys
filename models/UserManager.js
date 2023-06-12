const User = require('./User');

class UserManager {

    create = async (user) => {
        return await User.create(user);
    }

    get = async (id) => {
        return await User.findByPk(id);
    }

    getUserBy = async (params) => {
        return await User.findOne({where: params});
    }
}

module.exports = new UserManager();
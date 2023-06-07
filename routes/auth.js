var express = require('express');
var router = express.Router();
const database = require('./database')
const crypto = require('crypto');
const scryptSync =  crypto.scryptSync;

class User {
  constructor(data) {
    this.firstName = data.firstName.toLowerCase();
    this.lastName = data.lastName.toLowerCase();
    this.userName = data.userName.toLowerCase();
    this.email = data.email.toLowerCase();
    this.password = User.encodePassword(data.password);
  }

  static encodePassword(_password) {
    // encode password here
    const key1 = scryptSync(_password, 'salt', 64);
    return key1.toString('hex');
  }
}

class UserManager {
  save(user) {
    user.id = crypto.randomUUID(); // generate new ID
    database.users.push(user);
    return user;
  }

  getUserById(userId) {
    return database.users.filter(user => user.userId === userId)[0];
  }
  getUserByUserName(userName) {
    return database.users.filter(user => user.userName === userName)[0];
  }
  signUpCheck(userName, email) {
    const user = database.users.filter(user => user.userName === userName || user.email === email)[0];
    return user ? true : false ;
  }
  loginCheck(userName, password) {
    return database.users.filter(user => user.userName === userName && user.password === password)[0];
  }
}

const userManager = new UserManager();


/* simple sign in. */
router.post('/sign-in', function(req, res, next) {
  let userName = req.body.userName.toLowerCase();
  let password = User.encodePassword(req.body.password);
  const user = userManager.loginCheck(userName, password);
  if(user) {
    delete user.password;
    res.json(user)
  }else {
    res.json({"error":"username or password invalide"});
  }
});

/* sign up. */
router.post('/sign-up', function(req, res, next) {
  const user = new User(req.body.data);
  if(!userManager.signUpCheck(user.userName, user.email)) {
    const saveUser = userManager.save(user);
    saveUser.password;
    res.json(saveUser);
  }else{
    res.json({error:'This user already exist'});
  }
});

module.exports = router;
var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const scryptSync =  crypto.scryptSync;
const userManager =  require('../models/UserManager');
const credentialManager =  require('../models/CredentialManager');
const challengeManager =  require('../models/ChallengeManager');
const  isoBase64URL = require('@simplewebauthn/server/helpers'); 
const SimpleWebAuthnServer = require('@simplewebauthn/server');
const rpID = 'localhost';
const origin = `http://${rpID}:${process.env.PORT || 3000}`;



// Encode password
function encodePassword(_password) {
  const key = scryptSync(_password, 'salt', 64);
  return key.toString('hex');
}


/* simple sign in. */
router.post('/sign-in', async function(req, res, next) {
  let userName = req.body.userName.toLowerCase();
  let password = encodePassword(req.body.password);
  const user = (await userManager.getUserBy({'userName':userName, 'password': password}))?.toJSON();
  if(user) {
    delete user.password;
    res.json(user)
  }else {
    res.json({"error":"Invalid username or password"});
  }
});

/* sign up. */
router.post('/sign-up', async function(req, res, next) {
  const data = {...req.body.data};
  data.firstName = data.firstName.toLowerCase();
  data.lastName = data.lastName.toLowerCase();
  data.userName = data.userName.toLowerCase();
  data.email = data.email.toLowerCase();
  data.password = encodePassword(data.password);
  // check user existence first
  const userCheckIn = await userManager.getUserBy({'userName':data.userName, 'password': data.password});
  if(!userCheckIn) {
    // generate id for the user
    const id = isoBase64URL.isoBase64URL.fromBuffer(crypto.randomBytes(32));
    data.id = id;
    const saveUser = await userManager.create(data);
    if(saveUser) {
      delete saveUser.password;
      res.json(saveUser);
    }else{
      res.json({error:'error'});
    }
  }else{
    res.json({error:'This user already exist'});
  }
});


/**
 * This controller allows to create options needed on the frontend to create a passkey
 * These options are:
 *  challenge which is a random ArrayBuffer tobe encode in base64URL
 *  the user details {id, username, displayName, etc....}
 *  The replying Party
 *  and all the excluded credentials
 */

router.post("/request-options", async function(req, res, next) {
  // retrieve the user 
  const user = (await userManager.getUserBy({"userName":req.body.userName}))?.toJSON();
  if(user) {
    // retrieve the current user credentials
    let credentials = (await credentialManager.getAllCrentialsByUserId(user.id));
    if(credentials.length > 0) {
      credentials = credentials.map( (authenticator) =>{
        const _auth = authenticator.toJSON();
        return {
          id: isoBase64URL.isoBase64URL.toBuffer(_auth.id),
          type: 'public-key',
          // Optional
          transports: JSON.parse(_auth.transport),
        }
      })
    }
  
    const rpName = 'Passkeys Demo';
    const userID = user.id;
    const userName = user.userName;
    let options;
    if(req.body.action === 'signUp' ){
      options = SimpleWebAuthnServer.generateRegistrationOptions({
        rpName,
        rpID,
        userID: userID,
        userName: userName,
        // Don't prompt users for additional information about the authenticator
        // (Recommended for smoother UX)
        attestationType: 'none',
        // Prevent users from re-registering existing authenticators
        excludeCredentials: credentials,
      });
    } else {
      options = SimpleWebAuthnServer.generateAuthenticationOptions({
        // Require users to use a previously-registered authenticator
        allowCredentials: credentials,
        userVerification: 'preferred',
      });
    }
  
    // Keep the challenge in the session
   //await challengeManager.create({"challenge":options.challenge});
  
    res.json(options);
  }else {
    res.json({'error':"error"});
  }

});

/**
 * Verification registration
 */
router.post("/register-response", async function(req, res, next){
  const expectedOrigin = origin;
  const expectedRPID = rpID;
  const response = req.body;
  const expectedChallenge = response.challenge;

  try {
    // Verify the credential
    const { verified, registrationInfo } = await SimpleWebAuthnServer.verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      requireUserVerification: false,
    });

    if (!verified) {
      throw new Error('User verification failed.');
    }
    
    const { credentialPublicKey, credentialID } = registrationInfo;

    const base64CredentialID = isoBase64URL.isoBase64URL.fromBuffer(credentialID);
    const base64PublicKey = isoBase64URL.isoBase64URL.fromBuffer(credentialPublicKey);

    const user = (await userManager.get(response.userId)).toJSON();
    await credentialManager.create({
      id: base64CredentialID,
      publicKey: base64PublicKey,
      name: req.useragent.platform, // Name the passkey with a user-agent string
      transport: JSON.stringify(response.response.transports),
      UserId: user.id,
    });
    return res.json(user);
  } catch (e) {
    return res.status(400).send({ error: e.message });
  }
})

/**
 * Verification on SignIn
 */
router.post('/verification-signIn', async function(req, res, next){
  const { body } = req;
  const user = (await userManager.getUserBy({"userName":body.userName})).toJSON();
  if(user){
    const expectedChallenge = body.challenge;
    const authenticator = (await credentialManager.getUserAuthenticator(user.id, body.id)).toJSON();
    if (!authenticator) {
      throw new Error(`Could not find authenticator ${body.id} for user ${user.id}`);
    }
    authenticator.credentialPublicKey =isoBase64URL.isoBase64URL.toBuffer(authenticator.publicKey)
    authenticator.credentialID = isoBase64URL.isoBase64URL.toBuffer(authenticator.id)
    let verification;
    try {
      verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.message });
    }
    
    const { verified } = verification;
    if(verified){
      user.verified = verified;
      res.json(user);
    }else
    {
      res.json({'error':"error"});
    }
  }else {
    res.json({'error':"error"});
  }
})


module.exports = router;
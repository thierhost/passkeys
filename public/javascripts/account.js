// Load user details
const user = JSON.parse(localStorage.getItem('user'));
const btnLogout = document.getElementById('btnLogOut');
if(!user) {
    window.location = "/"
}else{
    const ul = document.createElement('ul');
    const sectionAcount = document.getElementById("accountDetails");
    for (proprety in user) {
        let li = document.createElement('li');
        li.setHTML(`${proprety} : ${user[proprety]}`);
        ul.appendChild(li);
    }
    sectionAcount.append(ul);
}



// Availability of `window.PublicKeyCredential` means WebAuthn is usable.  
// `isUserVerifyingPlatformAuthenticatorAvailable` means the feature detection is usable.  
// `​​isConditionalMediationAvailable` means the feature detection is usable.  
if (window.PublicKeyCredential &&  
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&  
    PublicKeyCredential.isConditionalMediationAvailable) {  
  // Check if user verifying platform authenticator is available.  
  Promise.all([  
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),  
    PublicKeyCredential.isConditionalMediationAvailable(),  
  ]).then(results => {  
    if (results.every(r => r === true)) {  
      // Display "Create a new passkey" button
      const btn = document.getElementById('btnCreatePasskey');
      btn.classList.remove('hidden');
      btn.addEventListener('click', createPasskey);
    }  
  });  
}  


async function createPasskey(){
    // request challenge and details from the server side
    let options = await requestOptions();
    localStorage.setItem('challenge', options.challenge)
    // create the credential using the authenticator
    let attResp = await SimpleWebAuthnBrowser.startRegistration(options);
    attResp.userId = user.id;
    attResp.challenge = options.challenge;
    let authResponse = await submitRegistration(attResp);
    if(authResponse.id) {
        alert("passkey created successfully")
    }
    // send the credential to the server side
}

/**
 * Request options
 * @returns 
 */
async function requestOptions() {
    const options = {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({'userName': user.userName, 'userId': user.id , 'action': 'signUp'}), 
      }
    const response = await fetch('/auth/request-options', options);
    return await response.json();
}

/**
 * Submit registration
 */

async function submitRegistration(attestation) {
    const options = {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attestation), 
      }
    const response = await fetch('/auth/register-response', options);
    return await response.json();
}

/** 
 * logout
*/
btnLogout.addEventListener('click', () => {
    localStorage.clear();
    window.location = "/";
})
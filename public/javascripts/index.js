const btnSignUp = document.getElementById("signUpBtn");
const signInBtn = document.getElementById("signInBtn");
btnSignUp.addEventListener("click", signUp);
signInBtn.addEventListener("click", signIn);

/**
 * simple sign up
 * @param {*} event 
 */
async function signUp(event){
    event.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const userName = document.getElementById("userName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const data = {firstName, lastName, email, userName, password };
    const options = {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({data:data})
      }
    const response = await fetch('/auth/sign-up', options);
    const result = await response.json();
    if(result.id) {
        alert("account created");
    }else {
        alert(result.error)
    }
}

/**
 * 
 * simple sign in
 * @param {} event 
 */
async function signIn(event) {
    event.preventDefault();
    const userName = document.getElementById("signInUserName").value;
    const password = document.getElementById("signInPassword").value;
    const data = {userName, password};
    const options = {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), 
      }
    const response = await fetch('/auth/sign-in', options);
    const result = await response.json();
    if(result.id) {
      localStorage.setItem('user', JSON.stringify(result));
      window.location = '/account.html';
    }else {
        alert(result.error)
    }
}




/**
 * Request options
 * @returns 
 */
async function requestOptions(data) {
  const options = {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), 
    }
  const response = await fetch('/auth/request-options', options);
  return await response.json();
}

/**
 * Verif authentification
 */
async function authVerification(attestation){
  const options = {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(attestation), 
  }
  const response = await fetch('/auth/verification-signIn', options);
  return await response.json();
}

/**
 * API verification
 * // Availability of `window.PublicKeyCredential` means WebAuthn is usable.  
  
 */
async function checkIn() {
  if (window.PublicKeyCredential && PublicKeyCredential.isConditionalMediationAvailable) {  
    // Check if conditional mediation is available.  
    const isCMA = await PublicKeyCredential.isConditionalMediationAvailable();  
    if (isCMA) {  
      // Call WebAuthn authentication  
      const sectionPasskey = document.getElementById('sectionPasskey');
      sectionPasskey.classList.remove('hidden')
      const signInBtnPasskey = document.getElementById('signInBtnPasskey');
      signInBtnPasskey.addEventListener("click", async function(event){
        event.preventDefault()
        // request option
        let userName = document.getElementById("userNamePasskey").value;
        let options = await requestOptions({"userName": userName, 'action': 'signIn'});
        if(options.challenge) {
          localStorage.setItem('challenge', options.challenge);
          //start the auth
          let attResp = await SimpleWebAuthnBrowser.startAuthentication(options);
          attResp.challenge = options.challenge
          attResp.userName = userName;
          const verification = await authVerification(attResp);
          if(verification.verified){
            alert("successfully authenticated");
            localStorage.setItem('user', JSON.stringify(verification));
             window.location = '/account.html';
          }
        }
      })
    }  
  }
}

checkIn()
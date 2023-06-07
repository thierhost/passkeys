const btnSignUp = document.getElementById("signUpBtn");
const signInBtn = document.getElementById("signInBtn");
btnSignUp.addEventListener("click", signUp);
signInBtn.addEventListener("click", signIn);

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
        alert("Logged In");
    }else {
        alert(result.error)
    }
}
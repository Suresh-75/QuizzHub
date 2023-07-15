const signUpbutton = document.querySelector(".signUpbutton")
const loginbutton = document.querySelector(".loginbutton")
const signUpForm = document.querySelector(".signUpForm")
const loginForm = document.querySelector(".loginForm")

signUpbutton.addEventListener("click", (e) => {
    e.preventDefault()
    console.log("signUp")
    loginForm.classList.add("formDisplay");
    signUpForm.classList.remove("formDisplay")
})

loginbutton.addEventListener("click", (e) => {
    e.preventDefault()
    console.log("login")
    signUpForm.classList.add("formDisplay")
    loginForm.classList.remove("formDisplay");
})


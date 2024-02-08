const signupForm = document.querySelector('#signup-form');
const inputName = document.querySelector('#name');
const inputEmail = document.querySelector('#email');
const inputPhone = document.querySelector('#phone');
const inputPassword = document.querySelector('#password');
const signupButton = document.querySelector('#signup-button');
const errorMessageContainer = document.querySelector('#error-message-container');

signupForm.addEventListener('submit', onSubmit);

async function onSubmit(e) {
    e.preventDefault();

    const userData = {
        name: inputName.value,
        email: inputEmail.value,
        phone: inputPhone.value,
        password: inputPassword.value
    };

    try {
        const response = await axios.post("http://localhost:5000/signup", userData);
        console.log('Sign-Up successful:', response.data);


        alert(response.data.message);
        window.location.href = './login';

        clearInputs();
        errorMessageContainer.textContent = '';

    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            errorMessageContainer.textContent = err.response.data.message;
        } else {
            console.log('Error during sign-up:', err);
        }
    }
}
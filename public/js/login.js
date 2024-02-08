const loginForm = document.querySelector('#login-form');
const inputEmail = document.querySelector('#email');
const inputPassword = document.querySelector('#password');
const forgotPasswordButton = document.querySelector('#forgot-password-button');
const loginButton = document.querySelector('#login-button');
const errorMessageContainer = document.querySelector('#error-message-container');

loginForm.addEventListener('submit', onSubmit);

async function onSubmit(e) {
    e.preventDefault();

    const userData = {
        email: inputEmail.value,
        password: inputPassword.value
    };

    try {
        const response = await axios.post("http://localhost:5000/login", userData);
        console.log('Login successful:', response.data);

        if (response.data.success == true) {
            alert(response.data.message);
            localStorage.setItem('token', response.data.token);
            window.location.href = './chat';  
        }



        clearInputs();
        errorMessageContainer.textContent = '';

    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            errorMessageContainer.textContent = err.response.data.message;
        } else {
            console.log('Error during Login:', err);
        }
    }
}

forgotPasswordButton.addEventListener('click', async () => {
    window.location.href = '/forgotpassword'
});

function clearInputs() {
    inputEmail.value = '';
    inputPassword.value = '';
}
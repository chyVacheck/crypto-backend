// ! modules
const Auth = require('express').Router();

// * controllers
// ? users
const { users } = require('../controllers/user');
const { admins } = require('../controllers/admin');

// * middlewares
// ? validation
const Validator = require('./../middlewares/Validation');

// ? POST
// * регистрация
Auth.post('/signup', Validator.signup, users.sendCodeToEmail);

// * проверка кода и завершение регистрации
Auth.post('/verifyAndSignup', Validator.verifyAndSignup, users.createOne);

// * авторизация пользователя
Auth.post('/signin', Validator.signin, users.login);

// * авторизация админа
Auth.post('/login', Validator.adminSignin, admins.login);

module.exports = Auth;

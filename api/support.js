// ! modules
const Support = require('express').Router();

// * controllers
// ? support
const { support } = require('../controllers/support');

// * middlewares
// ? validation
const Validator = require('./../middlewares/Validation');

// ? POST
// * отправить сообщение в Support
Support.post('/mail', Validator.mail, support.sendMail);

module.exports = Support;

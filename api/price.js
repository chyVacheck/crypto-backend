// ! modules
const Price = require('express').Router();

// * controllers
// ? price
const { price } = require('../controllers/price');

// * middlewares
// ? validation
const Validator = require('./../middlewares/Validation');

// ? POST
// *
Price.get('/:ids/:vs_currencies', Validator.getPrices, price.getPrices);

module.exports = Price;

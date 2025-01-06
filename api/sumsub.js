//

// ! modules
const SumSub = require('express').Router();

// * controllers
// ? price
const { sumSub } = require('../controllers/sumSub');

// ? POST
// *
SumSub.post('accessToken/', sumSub.getAccessToken);

module.exports = SumSub;

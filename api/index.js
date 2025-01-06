// ! modules
const router = require('express').Router();

// api
const Auth = require('./auth');
const Admin = require('./admin');
const User = require('./user');
const Price = require('./price');
const Support = require('./support');
const Company = require('./company');

// * controllers
// ? auth
const { auth } = require('../controllers/auth');
const { support } = require('../controllers/support');

// ? middlewares
const jwtCheck = require('../middlewares/Auth');
const Validator = require('./../middlewares/Validation');

// * utils
// ? constants
const { SERVER_SETTING } = require('../utils/constants');
// ? NotFound
const { NotFound } = require('../utils/NotFound');

router.use(`/${SERVER_SETTING.URL}/v1/auth`, Auth); // ? Auth

router.post(
  `/${SERVER_SETTING.URL}/v1/support/mailToCommunicate`,
  Validator.mailToCommunicate,
  support.sendMailByEmail,
);

router.use(jwtCheck); // ? check cookie

router.delete(
  `/${SERVER_SETTING.URL}/v1/auth/signout`,
  Validator.signout,
  auth.signOut,
); // ? signout

router.use(`/${SERVER_SETTING.URL}/v1/admin`, Admin); // ? Admin

router.use(`/${SERVER_SETTING.URL}/v1/user`, User); // ? User

router.use(`/${SERVER_SETTING.URL}/v1/company`, Company); // ? Company

router.use(`/${SERVER_SETTING.URL}/v1/support`, Support); // ? Support

router.use(`/${SERVER_SETTING.URL}/v1/price`, Price); // ? Price

router.use(`*`, NotFound); // ? error 404 for another routers

module.exports = router;

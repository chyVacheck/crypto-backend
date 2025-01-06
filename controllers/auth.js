// * utils
// ? constants
const { MESSAGE } = require('../utils/constants');

class Auth {
  // ? выход из системы
  signOut = (req, res) => {
    res.clearCookie('jwt').send({ message: MESSAGE.INFO.LOGOUT });
  };
}
const auth = new Auth();

module.exports = { auth };

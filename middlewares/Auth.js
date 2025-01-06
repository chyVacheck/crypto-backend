// ! modules
const jwt = require('jsonwebtoken');
// * errors
const { NotAuthorizedError } = require('../errors/AllErrors');
// * utils
// ? constants
const { MESSAGE, SERVER_SETTING } = require('../utils/constants');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    next(new NotAuthorizedError(MESSAGE.ERROR.NOT_AUTHORIZED.SIMPLE));
    return;
  }

  let payload;

  try {
    payload = jwt.verify(token, SERVER_SETTING.JWT_SECRET);
  } catch (error) {
    throw new NotAuthorizedError(MESSAGE.ERROR.NOT_AUTHORIZED.SIMPLE);
  }

  req.user = payload;
  next();
};

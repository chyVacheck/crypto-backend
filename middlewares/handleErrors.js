// * utils
// ? constants
const { MESSAGE, STATUS } = require('../utils/constants');

module.exports.handleErrors = (err, req, res, next) => {
  const { statusCode = STATUS.ERROR.SERVER, message } = err;

  console.log('\nError was catch:\n\n', err);

  res.status(statusCode).send({
    message:
      statusCode === STATUS.ERROR.SERVER
        ? MESSAGE.ERROR.SERVER.SIMPLE
        : message,
  });

  next();
};

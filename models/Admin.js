// ? modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ? constants
const { VALID_VALUES, MESSAGE } = require('../utils/constants');

// * errors
const { BadRequestError, NotFoundError } = require('../errors/AllErrors');

const adminSchema = new mongoose.Schema(
  {
    login: {
      type: String,
      required: true,
      unique: true,
      maxlength: VALID_VALUES.TEXT.LENGTH.MAX,
      minlength: VALID_VALUES.TEXT.LENGTH.MIN,
    },
    email: {
      type: String,
      minlength: VALID_VALUES.EMAIL.LENGTH.MIN,
      // unique: true, // ! необходимо самому проверять на уникальность почты
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { versionKey: false },
);

function findAdminByCredentials(login, password) {
  return this.findOne({ login })
    .select('+password')
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.ADMIN))
    .then((admin) => {
      if (!admin) {
        throw new NotAuthorized(MESSAGE.ERROR.NOT_AUTHORIZED.SIMPLE);
      }
      return bcrypt.compare(password, admin.password).then((matched) => {
        if (!matched) {
          throw new BadRequestError(MESSAGE.ERROR.PASS.SIMPLE);
        }
        return admin;
      });
    });
}

adminSchema.statics.findAdminByCredentials = findAdminByCredentials;

module.exports = mongoose.model('admin', adminSchema);

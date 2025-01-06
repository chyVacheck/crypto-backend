// ! modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// * errors
const { BadRequestError, NotFoundError } = require('../errors/AllErrors');

// * utils
// ? constants
const { VALID_VALUES, MESSAGE } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: VALID_VALUES.TEXT.LENGTH.MAX,
      minlength: VALID_VALUES.TEXT.LENGTH.MIN,
    },
    secondName: {
      type: String,
      required: true,
      maxlength: VALID_VALUES.TEXT.LENGTH.MAX,
      minlength: VALID_VALUES.TEXT.LENGTH.MIN,
    },
    email: {
      type: String,
      required: true,
      minlength: VALID_VALUES.EMAIL.LENGTH.MIN,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    typeOfUser: {
      type: String,
      enum: VALID_VALUES.USER.TYPE.VALUES,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    passport: {
      name: {
        type: String,
      },
      data: {
        type: Buffer,
        select: false,
      },
      type: {
        type: String,
      },
    },
    proofOfAddress: {
      name: {
        type: String,
      },
      data: {
        type: Buffer,
        select: false,
      },
      type: {
        type: String,
      },
    },
    selfieWithIDOrPassport: {
      name: {
        type: String,
      },
      data: {
        type: Buffer,
        select: false,
      },
      type: {
        type: String,
      },
    },
  },
  { versionKey: false },
);

function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
    .then((user) => {
      if (!user) {
        throw new NotAuthorized(MESSAGE.ERROR.NOT_AUTHORIZED.SIMPLE);
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new BadRequestError(MESSAGE.ERROR.PASS.SIMPLE);
        }
        return user;
      });
    });
}

userSchema.statics.findUserByCredentials = findUserByCredentials;

module.exports = mongoose.model('user', userSchema);

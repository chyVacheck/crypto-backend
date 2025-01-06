// ! modules
const mongoose = require('mongoose');

// * utils
// ? constants
const { VALID_VALUES, MESSAGE } = require('../utils/constants');

// * errors
const { BadRequestError, NotFoundError } = require('../errors/AllErrors');

const temporaryUserSchema = new mongoose.Schema(
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
    },
    code: {
      type: String,
      required: true,
    },
    timeEnd: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 3,
    },
  },
  { versionKey: false },
);

function findUserByEmail(email, code) {
  return this.findOne({ email })
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.EMAIL))
    .then((user) => {
      return user.code === code ? user : new BadRequestError('Code is wrong');
    });
}

temporaryUserSchema.statics.findUserByEmail = findUserByEmail;

module.exports = mongoose.model('temporaryUser', temporaryUserSchema);

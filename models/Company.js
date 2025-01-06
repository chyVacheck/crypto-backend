// ! modules
const mongoose = require('mongoose');

// ? constants
const { VALID_VALUES } = require('../utils/constants');

const companySchema = new mongoose.Schema(
  {
    owners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    name: {
      type: String,
      maxlength: VALID_VALUES.TEXT.LENGTH.MAX,
      minlength: VALID_VALUES.TEXT.LENGTH.MIN,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    legalAddress: {
      type: String,
    },
    city: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    legalForm: {
      type: String,
      enum: VALID_VALUES.LEGAL_FORM.VALUES,
    },
    countryOfRegistration: {
      type: String,
    },
    VAT: {
      type: String,
      minlength: VALID_VALUES.VAT_NUMBER.LENGTH.MIN,
      maxlength: VALID_VALUES.VAT_NUMBER.LENGTH.MAX,
    },
    registrationDate: {
      type: Date,
    },
    certificateOfIncorporation: {
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
    bankAccount: {
      bankName: {
        type: String,
      },
      bankCode: {
        type: String,
      },
      IBAN: {
        type: String,
      },
      accountHolderName: {
        type: String,
      },
    },
    shareholders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shareholder',
      },
    ],
  },
  { versionKey: false },
);

module.exports = mongoose.model('company', companySchema);

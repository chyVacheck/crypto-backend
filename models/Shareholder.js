// ! modules
const mongoose = require('mongoose');

// ? constants
const { VALID_VALUES } = require('../utils/constants');

const shareholderSchema = new mongoose.Schema(
  {
    typeOfShareholder: {
      type: String,
      enum: VALID_VALUES.SHARE_HOLDER.VALUES,
      required: true,
    },
    percentageOfOwnership: {
      type: Number,
      require: true,
    },
    individual: {
      // individual
      fullName: {
        type: String,
        maxlength: VALID_VALUES.TEXT.LENGTH.MAX,
        minlength: VALID_VALUES.TEXT.LENGTH.MIN,
      },
      contactEmail: {
        type: String,
      },
      jobTitle: {
        type: String,
      },
      phoneNumber: {
        type: String,
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
    },
    company: {
      // company
      name: {
        type: String,
        maxlength: VALID_VALUES.TEXT.LENGTH.MAX,
        minlength: VALID_VALUES.TEXT.LENGTH.MIN,
      },
      registrationNumber: {
        type: String,
      },
      legalForm: {
        type: String,
        enum: VALID_VALUES.LEGAL_FORM.VALUES,
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
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('shareholder', shareholderSchema);

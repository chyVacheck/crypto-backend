// ! modules
const { Joi, celebrate } = require('celebrate');

// * utils
// ? constants
const { VALID_VALUES } = require('../utils/constants');

class Validator {}

Validator.signup = celebrate({
  body: Joi.object().keys({
    name: Joi.string()
      .required()
      .min(VALID_VALUES.TEXT.LENGTH.MIN)
      .max(VALID_VALUES.TEXT.LENGTH.MAX),
    secondName: Joi.string()
      .required()
      .min(VALID_VALUES.TEXT.LENGTH.MIN)
      .max(VALID_VALUES.TEXT.LENGTH.MAX),
    email: Joi.string().min(VALID_VALUES.EMAIL.LENGTH.MIN).required(),
    phone: Joi.string().required(),
    password: Joi.string()
      .required()
      .min(VALID_VALUES.PASSWORD.LENGTH.MIN)
      .max(VALID_VALUES.PASSWORD.LENGTH.MAX),
  }),
});

Validator.verifyAndSignup = celebrate({
  body: Joi.object().keys({
    email: Joi.string().min(VALID_VALUES.EMAIL.LENGTH.MIN).required(),
    code: Joi.string().required(),
  }),
});

Validator.signin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().min(VALID_VALUES.EMAIL.LENGTH.MIN),
    password: Joi.string()
      .required()
      .min(VALID_VALUES.PASSWORD.LENGTH.MIN)
      .max(VALID_VALUES.PASSWORD.LENGTH.MAX),
  }),
});

Validator.adminSignin = celebrate({
  body: Joi.object().keys({
    login: Joi.string().required().min(VALID_VALUES.TEXT.LENGTH.MIN),
    password: Joi.string()
      .required()
      .min(VALID_VALUES.PASSWORD.LENGTH.MIN)
      .max(VALID_VALUES.PASSWORD.LENGTH.MAX),
  }),
});

Validator.createOneAdmin = celebrate({
  body: Joi.object().keys({
    login: Joi.string().required().min(VALID_VALUES.TEXT.LENGTH.MIN),
    email: Joi.string().min(VALID_VALUES.EMAIL.LENGTH.MIN),
    password: Joi.string()
      .required()
      .min(VALID_VALUES.PASSWORD.LENGTH.MIN)
      .max(VALID_VALUES.PASSWORD.LENGTH.MAX),
  }),
});

Validator.signout = celebrate({
  body: Joi.object().keys({}),
});

Validator.usersFile = celebrate({
  params: Joi.object().keys({
    typeOfFile: Joi.string()
      .valid(...VALID_VALUES.USER.FILE.VALUES)
      .required(),
  }),
});

Validator.userId = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
  }),
});

Validator.companyId = celebrate({
  params: Joi.object().keys({
    companyId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
  }),
});

Validator.companyIdShareholderId = celebrate({
  params: Joi.object().keys({
    companyId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
    shareholderId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
  }),
});

Validator.companyIdShareholderIdUpdate = celebrate({
  params: Joi.object().keys({
    companyId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
    shareholderId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
  }),
  body: Joi.object()
    .keys({
      percentageOfOwnership: Joi.number().min(0).max(100).allow(null),
      // company
      name: Joi.string(),
      legalForm: Joi.string().allow(null),
      legalAddress: Joi.string().allow(null),
      city: Joi.string().allow(null),
      zipCode: Joi.string().allow(null),
      countryOfRegistration: Joi.string().allow(null),
      VAT: Joi.string().allow(null),
      registrationDate: Joi.string().allow(null),
      // individual
      fullName: Joi.string(),
      contactEmail: Joi.string().allow(null),
      jobTitle: Joi.string().allow(null),
      phoneNumber: Joi.string().allow(null),
    })
    .min(1)
    .required(),
});

Validator.companyIdShareholderIdFile = celebrate({
  params: Joi.object().keys({
    companyId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
    shareholderId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
    typeOfFile: Joi.string()
      .valid(...VALID_VALUES.SHARE_HOLDER.FILE.VALUES)
      .required(),
  }),
});

Validator.userIdUsersFile = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
    typeOfFile: Joi.string()
      .valid(...VALID_VALUES.USER.FILE.VALUES)
      .required(),
  }),
});

Validator.patchUserData = celebrate({
  body: Joi.object().keys({
    name: Joi.string()
      .min(VALID_VALUES.TEXT.LENGTH.MIN)
      .max(VALID_VALUES.TEXT.LENGTH.MAX)
      .allow(null),
    secondName: Joi.string()
      .min(VALID_VALUES.TEXT.LENGTH.MIN)
      .max(VALID_VALUES.TEXT.LENGTH.MAX)
      .allow(null),
    phone: Joi.string().allow(null),
    // typeOfUser: Joi.string().valid(...VALID_VALUES.USER.TYPE.VALUES),
  }),
});

Validator.createCompany = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    registrationNumber: Joi.string().required(),
    legalAddress: Joi.string(),
    city: Joi.string(),
    zipCode: Joi.number(),
    legalForm: Joi.string().valid(...VALID_VALUES.LEGAL_FORM.VALUES),
    countryOfRegistration: Joi.string(),
    VAT: Joi.string()
      .min(VALID_VALUES.VAT_NUMBER.LENGTH.MIN)
      .max(VALID_VALUES.VAT_NUMBER.LENGTH.MAX),
    registrationDate: Joi.string(),
    bankAccount: Joi.object()
      .keys({
        bankName: Joi.string(),
        bankCode: Joi.string(),
        IBAN: Joi.string(),
        accountHolderName: Joi.string(),
      })
      .min(1),
    shareholders: Joi.array()
      .items(
        Joi.object()
          .required()
          .keys({
            typeOfShareholder: Joi.string()
              .required()
              .valid(...VALID_VALUES.SHARE_HOLDER.VALUES),
            percentageOfOwnership: Joi.number().min(0).max(100),
            data: Joi.when('typeOfShareholder', {
              is: 'company',
              then: Joi.object({
                name: Joi.string(),
                registrationNumber: Joi.string().required(),
                legalForm: Joi.string(),
                legalAddress: Joi.string(),
                city: Joi.string(),
                zipCode: Joi.string(),
                countryOfRegistration: Joi.string(),
                VAT: Joi.string()
                  .min(VALID_VALUES.VAT_NUMBER.LENGTH.MIN)
                  .max(VALID_VALUES.VAT_NUMBER.LENGTH.MAX),
                registrationDate: Joi.string(),
              }),
              otherwise: Joi.object({
                fullName: Joi.string(),
                contactEmail: Joi.string(),
                jobTitle: Joi.string(),
                phoneNumber: Joi.string(),
              }).min(1),
            }).required(),
          }),
      )
      .max(10),
  }),
});

Validator.addShareholder = celebrate({
  params: Joi.object().keys({
    companyId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
  }),
  body: Joi.object().keys({
    typeOfShareholder: Joi.string()
      .required()
      .valid(...VALID_VALUES.SHARE_HOLDER.VALUES),
    percentageOfOwnership: Joi.number().min(0).max(100),
    data: Joi.when('typeOfShareholder', {
      is: 'company',
      then: Joi.object({
        name: Joi.string(),
        registrationNumber: Joi.string().required(),
        legalForm: Joi.string(),
        legalAddress: Joi.string(),
        city: Joi.string(),
        zipCode: Joi.string(),
        countryOfRegistration: Joi.string(),
        VAT: Joi.string()
          .min(VALID_VALUES.VAT_NUMBER.LENGTH.MIN)
          .max(VALID_VALUES.VAT_NUMBER.LENGTH.MAX),
        registrationDate: Joi.string(),
      }),
      otherwise: Joi.object({
        fullName: Joi.string().required(),
        contactEmail: Joi.string(),
        jobTitle: Joi.string(),
        phoneNumber: Joi.string(),
      }),
    }).required(),
  }),
});

Validator.updateCompanyDataById = celebrate({
  params: Joi.object().keys({
    companyId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      legalAddress: Joi.string().allow(null),
      city: Joi.string().allow(null),
      zipCode: Joi.string().allow(null),
      legalForm: Joi.string()
        .valid(...VALID_VALUES.LEGAL_FORM.VALUES)
        .allow(null),
      countryOfRegistration: Joi.string().allow(null),
      VAT: Joi.string()
        .min(VALID_VALUES.VAT_NUMBER.LENGTH.MIN)
        .max(VALID_VALUES.VAT_NUMBER.LENGTH.MAX)
        .allow(null),
      registrationDate: Joi.date().allow(null),
      bankAccount: {
        bankName: Joi.string().allow(null),
        bankCode: Joi.string().allow(null),
        IBAN: Joi.string().allow(null),
        accountHolderName: Joi.string().allow(null),
      },
    })
    .min(1)
    .required(),
});

Validator.companyIdCompanyFile = celebrate({
  params: Joi.object().keys({
    companyId: Joi.string().length(VALID_VALUES.ID_LENGTH).required(),
    typeOfFile: Joi.string()
      .valid(...VALID_VALUES.COMPANY.FILE.VALUES)
      .required(),
  }),
});

Validator.mail = celebrate({
  body: Joi.object().keys({
    title: Joi.string().required().min(VALID_VALUES.MAIL.TITLE.LENGTH.MIN),
    message: Joi.string().required().min(VALID_VALUES.MAIL.MESSAGE.LENGTH.MIN),
  }),
});

Validator.mailToCommunicate = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(VALID_VALUES.TEXT.LENGTH.MIN),
    email: Joi.string().required().min(VALID_VALUES.EMAIL.LENGTH.MIN),
    message: Joi.string().required().min(VALID_VALUES.MAIL.MESSAGE.LENGTH.MIN),
  }),
});

Validator.getPrices = celebrate({
  params: Joi.object().keys({
    ids: Joi.string().required(),
    vs_currencies: Joi.string().required(),
  }),
});

module.exports = Validator;

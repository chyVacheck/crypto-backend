// ! modules
require('dotenv').config();
const validator = require('validator');

// ! config.json
const config = require('./../config/config.json');

const SUMSUB_APP_TOKEN =
  'sbx:VOAiGy8VJhEm5ClokHgl7dMC.4nvRh5gBO26YHTyDOFxN75E4ouN55ahw'; // Example: sbx:uY0CgwELmgUAEyl4hNWxLngb.0WSeQeiYny4WEqmAALEAiK2qTC96fBad - Please don't forget to change when switching to production
const SUMSUB_SECRET_KEY = 'aP4qZH0o32pP3AkNDGpMDskiFLVX2c81'; // Example: Hej2ch71kG2kTd1iIUDZFNsO5C1lh5Gq - Please don't forget to change when switching to production
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

const {
  PORT = config.PORT,
  URL = config.URL,
  DB_ADDRESS = config.DB_ADDRESS,
  JWT_SECRET = config.JWT_SECRET,
  EMAIL_SERVICE = config.ALL_EMAILS.SERVICE,
  EMAIL_SUPPORT_EMAIL = config.ALL_EMAILS.SUPPORT.EMAIL,
  EMAIL_SUPPORT_PASS = config.ALL_EMAILS.SUPPORT.PASS,
  EMAIL_SYSTEM_EMAIL = config.ALL_EMAILS.SYSTEM.EMAIL,
  EMAIL_SYSTEM_PASS = config.ALL_EMAILS.SYSTEM.PASS,
  EMAIL_COMPANY_EMAIL = config.ALL_EMAILS.COMPANY.EMAIL,
  EMAIL_COMPANY_PASS = config.ALL_EMAILS.COMPANY.PASS,
  STATUS_DEV = config.STATUS_DEV,
  API_COINGECKO_URL = config.API_COINGECKO_URL,
} = process.env;

const DEV = STATUS_DEV === 'true';

// ? настройки сервера
const SERVER_SETTING = {
  PORT: PORT,
  URL: URL,
  DB_ADDRESS: DB_ADDRESS,
  JWT_SECRET: JWT_SECRET,
};

const API_COINGECKO = {
  BASE_URL: API_COINGECKO_URL,
  IDS: {
    STRING:
      'bitcoin,ethereum,binancecoin,tether,solana,cardano,ripple,polkadot,usd-coin,dogecoin,avalanche-2,terra-luna-2,chainlink,algorand',
    ARRAY: [
      'algorand',
      'avalanche-2',
      'binancecoin',
      'bitcoin',
      'cardano',
      'chainlink',
      'dogecoin',
      'ethereum',
      'polkadot',
      'ripple',
      'solana',
      'terra-luna-2',
      'tether',
      'usd-coin',
    ],
  },
  VS_CURRENCIES: {
    STRING: 'usd,eur',
    ARRAY: ['usd', 'eur'],
  },
};

// ? для ответов на запросы
const MESSAGE = {
  ERROR: {
    TOO_MANY_REQUESTS: {
      SIMPLE: 'Too many requests, try later',
    },
    UPDATE_REQUEST: {
      SIMPLE: 'The request has already been accepted',
    },
    BAD_REQUEST: {
      PERCENT_TO_MUCH:
        "The total number of percentages of the company's shares must not exceed 100",
      FILE_BAD_TYPE: 'File must be another type',
      FILE_TOO_HEAVY: 'File is too large',
      FILE_NOT_UPLOAD: 'File was not uploaded',
      SIMPLE: 'BAD REQUEST',
      EMAIL_CODE: 'Your code is wrong, try again',
      VERIFY_FAILED:
        'You entered the wrong code three times, mail verification rejected, try again.',
    },
    INCORRECT_DATA: {
      SIMPLE: 'Incorrect data entered',
    },
    FORBIDDEN: {
      SIMPLE: 'You are not allowed to do this operation',
      TIME_UP: 'Confirmation time is up, try get new code',
      MUST_BE_USER: 'You must be user',
      MUST_BE_ADMIN: 'You must be admin',
      SHAREHOLDER: "This shareholder is not your's",
      TOO_FEW_SHAREHOLDER: 'You may not delete all shareholders',
      FILE: 'You are not allowed to upload this type of file',
      ONLY_ONE_COMPANY: 'One user can have only one company',
    },
    NOT_FOUND: {
      FILE: "Looks like there aren't this file yet",
      SIMPLE: 'Not found',
      COMPANY: 'Company not found',
      SHAREHOLDER: 'Shareholder not found',
      USER: 'User not found',
      USERS: 'No user found',
      ROUTER: 'Router not found',
      ADMIN: 'Admin not found',
      EMAIL: 'To get started, get a verification code in the email',
      TEMPORARY_USER:
        'The registration time is up or you have entered the code incorrectly several times in a row',
    },
    NOT_AUTHORIZED: {
      SIMPLE: 'User is not authorized',
    },
    SERVER: {
      SIMPLE: 'SERVER ERROR',
    },
    PASS: {
      SIMPLE: 'Wrong password',
    },
    DUPLICATE: {
      SIMPLE: 'You can not use these parameters, try other ones',
      REGISTRATION_NUMBER:
        'This registration number is already in use, enter a different one',
      MAIL: 'You have not yet completed your last registration',
      ADMIN: 'There are already Admin with this email',
      USER: 'There is already a user with this mail',
    },
    VALIDATION: {
      SIMPLE: 'Validation error',
      EMAIL: 'Email validation error',
      URL: 'URL validation error',
    },
  },
  INFO: {
    CREATED: {
      SIMPLE: 'CREATED',
      SHAREHOLDER: 'Shareholder has been created',
      USER: 'User has been created',
      MAIL: 'Code was successfully send to your email address',
      SYSTEM_MAIL: 'Mail was successfully send',
      SUPPORT_MAIL: 'Mail was successfully send',
      ADMIN: 'Admin has been created',
      COMPANY: 'Company has been created',
    },
    POST: {
      SIMPLE: 'Was successful posted',
      TWO_FACTOR_ON: 'Two factor now is turn on',
      TWO_FACTOR_OFF: 'Two factor now is turn off',
    },
    DELETE: {
      SIMPLE: 'Deleted',
      FILE: 'File was successful deleted',
    },
    PUT: {
      SIMPLE: 'Was successful put',
      FILE: 'File was successful upload',
    },
    PATCH: {
      SIMPLE: 'Info patched',
      USER: 'Info of user was successful updated',
      COMPANY: 'Info of company was successful updated',
    },
    LOGOUT: 'You have successfully logged out',
    LOGIN: 'You have successfully logged in',
  },
};
const STATUS = {
  ERROR: {
    BAD_REQUEST: 400,
    NOT_AUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    SERVER: 500,
  },
  INFO: {
    OK: 200,
    CREATED: 201,
  },
};

const VALID_VALUES = {
  ID_LENGTH: 24,
  TEXT: {
    LENGTH: {
      MIN: 2,
      MAX: 32,
    },
  },
  MAIL: {
    TITLE: {
      LENGTH: {
        MIN: 2,
        MAX: 32,
      },
    },
    MESSAGE: {
      LENGTH: {
        MIN: 10,
        MAX: 4000,
      },
    },
  },
  PASSWORD: {
    LENGTH: {
      MIN: 2,
      MAX: 32,
    },
  },
  EMAIL: {
    LENGTH: {
      MIN: 5,
    },
  },
  REGISTRATION_NUMBER: {
    LENGTH: {
      MIN: 1, // TODO
      MAX: 20,
    },
  },
  ZIP_CODE: {
    LENGTH: {
      MIN: 1, // TODO
      MAX: 6,
    },
  },
  LEGAL_FORM: {
    VALUES: [
      'Limited Liability Company',
      'Self Employed',
      'Individual trader',
      'General Partnership',
      'Limited partnership',
      'Society',
      'Government LLC',
      'Foundation',
      'Other',
    ],
  },
  VAT_NUMBER: {
    LENGTH: {
      MIN: 1, // TODO
      MAX: 20,
    },
  },
  SHARE_HOLDER: {
    VALUES: ['individual', 'company'],
    FILE: {
      TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
      SIZE: {
        MAX: 10 * 1025 * 1024,
      },
      VALUES: ['certificateOfIncorporation', 'passport', 'proofOfAddress'],
    },
    INDIVIDUAL: {
      FILE: {
        TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
        SIZE: {
          MAX: 5 * 1025 * 1024,
        },
        VALUES: ['passport', 'proofOfAddress'],
      },
    },
    COMPANY: {
      FILE: {
        TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
        SIZE: {
          MAX: 10 * 1025 * 1024,
        },
        VALUES: ['certificateOfIncorporation'],
      },
    },
  },
  USER: {
    TYPE: {
      VALUES: ['Individual', 'Legal entity'],
    },
    FILE: {
      TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
      SIZE: {
        MAX: 5 * 1025 * 1024,
      },
      VALUES: ['passport', 'proofOfAddress', 'selfieWithIDOrPassport'],
    },
  },
  COMPANY: {
    FILE: {
      TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
      SIZE: {
        MAX: 10 * 1025 * 1024,
      },
      VALUES: ['certificateOfIncorporation'],
    },
  },
};

const EMAILS = {
  SERVICE: EMAIL_SERVICE,
  SUPPORT: {
    EMAIL: EMAIL_SUPPORT_EMAIL,
    PASS: EMAIL_SUPPORT_PASS,
  },
  SYSTEM: {
    EMAIL: EMAIL_SYSTEM_EMAIL,
    PASS: EMAIL_SYSTEM_PASS,
  },
  COMPANY: {
    EMAIL: EMAIL_COMPANY_EMAIL,
    PASS: EMAIL_COMPANY_PASS,
  },
};

const isThisURL = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  throw new Error(MESSAGE.ERROR.VALIDATION.URL);
};

// * экспорт всех констант
module.exports = {
  SERVER_SETTING,
  MESSAGE,
  STATUS,
  VALID_VALUES,
  EMAILS,
  isThisURL,
  DEV,
  API_COINGECKO,
  SUMSUB_APP_TOKEN,
  SUMSUB_BASE_URL,
  SUMSUB_SECRET_KEY,
};

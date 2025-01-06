// ! modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// * errors
const {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} = require('../errors/AllErrors');

// * models
const admin = require('../models/Admin');
const user = require('../models/User');

// * utils
// ? constants
const {
  SERVER_SETTING,
  MESSAGE,
  STATUS,
  DEV,
  VALID_VALUES,
} = require('../utils/constants');

class Admins {
  constructor(data) {
    this.jwt_secret = data.jwt_secret;
    this.cookie_setting = data.cookie_setting;
  }

  // ? создание токена
  _createToken = (data) => jwt.sign(data, this.jwt_secret);

  // * GET
  // ? возвращает текущего администратора по _id
  getInfo = (req, res, next) => {
    const { _id, isAdmin } = req.user;

    // проверка доступа
    if (!isAdmin) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_ADMIN));
    }

    admin
      .findById(_id)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.ADMIN))
      .then((adminMe) => res.send({ data: adminMe }))
      .catch(next);
  };

  // ? возвращает всех пользователей
  getAllUser = (req, res, next) => {
    const { _id, isAdmin } = req.user;

    // проверка доступа
    if (!isAdmin) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_ADMIN));
    }

    user
      .find()
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USERS))
      .then((users) => res.send({ data: users }))
      .catch(next);
  };

  // ? возвращает всех пользователей
  getUserByUserId = (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { userId } = req.params;

    // проверка доступа
    if (!isAdmin) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_ADMIN));
    }

    user
      .findById(userId)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((user) => res.send({ data: user }))
      .catch(next);
  };

  // ? получение файла пользователя
  getUsersFileByUserId = (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { userId, typeOfFile } = req.params;

    // проверка доступа
    if (!isAdmin) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_ADMIN));
    }

    user
      .findById(userId)
      .select(`+${typeOfFile}.data`)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((userData) => {
        // проверка наличия файла
        if (typeof userData[typeOfFile].data === 'undefined') {
          return next(new NotFoundError(MESSAGE.ERROR.NOT_FOUND.FILE));
        }

        res.set('Content-Type', userData[typeOfFile].type);
        res.send(userData[typeOfFile].data);
      })
      .catch(next);
  };

  // * POST
  // ? создает пользователя
  createOne = async (req, res, next) => {
    const { isAdmin } = req.user;
    const { login, email, password } = req.body;

    // проверка доступа
    if (!isAdmin) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_ADMIN));
    }

    // проверка на уникальность почты
    const isEmailUnique = await admin
      .findOne({ email: email })
      .then(async (adminData) => {
        if (adminData && adminData.email) {
          return false;
        }
        return true;
      });

    if (!isEmailUnique) {
      return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.ADMIN));
    }

    bcrypt
      .hash(password, 10)
      .then(async (hash) => {
        await admin
          .create({
            login: login,
            email: email,
            password: hash,
          })
          .then(async (adminData) => {
            if (DEV) {
              res.status(STATUS.INFO.CREATED).send({
                message: MESSAGE.INFO.CREATED.ADMIN,
                data: adminData,
              });
            } else {
              res.status(STATUS.INFO.CREATED).send({
                message: MESSAGE.INFO.CREATED.ADMIN,
                data: {
                  login: adminData.login,
                  email: adminData.email,
                  _id: adminData._id,
                },
              });
            }
          });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(MESSAGE.ERROR.INCORRECT_DATA.SIMPLE));
        } else if (err.code === 11000) {
          next(new ConflictError(MESSAGE.ERROR.DUPLICATE.SIMPLE));
        } else {
          next(err);
        }
      });
  };

  // ? авторизация администратора
  login = (req, res, next) => {
    const { login, password } = req.body;
    return admin
      .findAdminByCredentials(login, password)
      .then((data) => {
        const { _id } = data;
        const token = this._createToken({ _id: _id, isAdmin: true });

        res.cookie('jwt', token, this.cookie_setting);
        res.send({ message: MESSAGE.INFO.LOGIN });
      })
      .catch((err) => {
        next(err);
      });
  };

  // * PUT
  // ? добавление файла пользователю
  addUsersFileByUserId = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { userId, typeOfFile } = req.params;

    // проверка доступа
    if (!isAdmin) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_ADMIN));
    }

    // наличие файла
    if (!req.file) {
      return next(
        new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.FILE_NOT_UPLOAD),
      );
    }

    const { originalname, mimetype, buffer, size } = req.file;

    // размер файла
    if (size > VALID_VALUES.USER.FILE.SIZE.MAX) {
      return next(
        new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.FILE_TOO_HEAVY),
      );
    }

    const options = { new: true };
    const updates = {
      passport: {
        passport: {
          name: originalname,
          data: buffer,
          type: mimetype,
        },
      },
      proofOfAddress: {
        proofOfAddress: {
          name: originalname,
          data: buffer,
          type: mimetype,
        },
      },
      selfieWithIDOrPassport: {
        selfieWithIDOrPassport: {
          name: originalname,
          data: buffer,
          type: mimetype,
        },
      },
    };

    const update = updates[typeOfFile];

    await user
      .findByIdAndUpdate(userId, update, options)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((userMe) =>
        res.send({ message: MESSAGE.INFO.PUT.FILE, data: userMe }),
      )
      .catch(next);
  };

  // * PATCH
  // ? изменение данных о пользователе
  patchUserDataByUserId = (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { userId } = req.params;

    // проверка доступа
    if (!isAdmin) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_ADMIN));
    }

    const options = { new: true };

    user
      .findByIdAndUpdate(userId, req.body, options)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((userMe) =>
        res.send({ message: MESSAGE.INFO.PATCH.USER, data: userMe }),
      )
      .catch(next);
  };

  // * DELETE
  // ? удаление файла у пользователя
  deleteUserFileById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { userId, typeOfFile } = req.params;

    // проверка доступа
    if (!isAdmin) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_ADMIN));
    }

    await user
      .findById(userId)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((userData) => {
        userData[typeOfFile] = undefined;
        userData.save().then(() => {
          res.send({ message: MESSAGE.INFO.DELETE.FILE });
        });
      })
      .catch(next);
  };
}

const admins = new Admins({
  jwt_secret: SERVER_SETTING.JWT_SECRET,
  cookie_setting: {
    expires: new Date(Date.now() + 12 * 3600000),
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  },
});

module.exports = { admins };

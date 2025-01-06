// ! modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Для отправки электронной почты

// * errors
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} = require('../errors/AllErrors');

// * models
const temporaryUser = require('../models/TemporaryUser');
const user = require('../models/User');

// * utils
// ? constants
const {
  SERVER_SETTING,
  MESSAGE,
  STATUS,
  EMAILS,
  VALID_VALUES,
  DEV,
} = require('../utils/constants');
// ? utils
const { generateRandomCode } = require('./../utils/utils');

class Users {
  constructor(data) {
    this.jwt_secret = data.jwt_secret;
    this.cookie_setting = data.cookie_setting;
  }

  // * GET
  // ? возвращает данные текущего пользователя по _id
  getInfo = (req, res, next) => {
    const { _id, isUser } = req.user;

    if (!isUser) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_USER));
    }

    user
      .findById(_id)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((userMe) => res.send({ data: userMe }))
      .catch(next);
  };

  // ? возвращает файл пользователя
  getFile = (req, res, next) => {
    const { _id, isUser } = req.user;
    const { typeOfFile } = req.params;

    // проверка доступа
    if (!isUser) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_USER));
    }

    user
      .findById(_id)
      .select(`+${typeOfFile}.data`)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((userMe) => {
        // проверка наличия файла
        if (typeof userMe[typeOfFile].data === 'undefined') {
          return next(new NotFoundError(MESSAGE.ERROR.NOT_FOUND.FILE));
        }
        res.set('Content-Type', userMe[typeOfFile].type);
        res.send(userMe[typeOfFile].data);
      })
      .catch(next);
  };

  // * POST
  // первый этап регистрации
  sendCodeToEmail = async (req, res, next) => {
    const { name, secondName, phone, email, password } = req.body;

    // проверка, что это первая регистрация пользователя
    const isFirstRegistration = await user
      .findOne({ email: email })
      .then((data) => {
        if (data) {
          return false;
        } else return true;
      });

    // проверка, что это нет активной регистрации пользователя
    const hasNowRegistration = await temporaryUser
      .findOne({ email: email })
      .then((data) => {
        if (data) {
          return false;
        } else return true;
      });

    if (!isFirstRegistration) {
      return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.USER));
    }
    if (!hasNowRegistration) {
      return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.MAIL));
    }

    bcrypt
      .hash(password, 10)
      .then(async (hash) => {
        const transporter = nodemailer.createTransport({
          service: EMAILS.SERVICE,
          auth: {
            user: EMAILS.SYSTEM.EMAIL, // Ваша Gmail почта
            pass: EMAILS.SYSTEM.PASS, // Пароль от почты
          },
        });

        const code = generateRandomCode(6);

        const mailOptions = {
          from: EMAILS.SYSTEM.EMAIL,
          to: email,
          subject: 'Registration confirmations',
          text: `Your registration code: ${code}`,
          html: `<!DOCTYPE html>
          <html lang="en" style="align: center">
            <head>
              <meta charset="UTF-8" />
            </head>
            <body style="align: center; margin: auto; max-width: 80%">
              <div
                style="
                  border-style: solid;
                  border-width: thin;
                  border-color: #dadce0;
                  border-radius: 8px;
                  padding: 40px 20px;
                "
                align="center"
                class="m_-821533581934671015mdv2rw"
              >
                <img
                  src="https://static.wixstatic.com/media/02fd0f_0f43b914b94c48799759d3d0f1b288c2~mv2.png/v1/fill/w_44,h_44,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/icon.png"
                  width="44"
                  height="44"
                  aria-hidden="true"
                  style="margin-bottom: 16px"
                  alt="Google"
                  data-bit="iit"
                />
                <div
                  style="
                    font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica, Arial,
                      sans-serif;
                    border-bottom: thin solid #dadce0;
                    color: rgba(0, 0, 0, 0.87);
                    line-height: 32px;
                    padding-bottom: 24px;
                    text-align: center;
                    word-break: break-word;
                  "
                >
                  <p style="font-size: 24px; max-width: 50%; margin: 0 auto">
                    You have received this email because you have started registration on
                    the SITE
                  </p>
                </div>
                <div
                  style="
                    font-family: Roboto-Regular, Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.87);
                    line-height: 20px;
                    padding: 40px 0 25px 0;
                    text-align: center;
                  "
                >
                  Your verify code is
                </div>
                <span style="font-size: 17px; line-height: 22px">${code}</span>
              </div>
              <div>
                <div
                  style="
                    font-family: Roboto-Regular, Helvetica, Arial, sans-serif;
                    color: rgba(0, 0, 0, 0.54);
                    font-size: 11px;
                    line-height: 18px;
                    padding-top: 12px;
                    text-align: center;
                  "
                >
                  <div>
                    If you have not registered on the SITE, then just ignore this email
                  </div>
                  <div style="direction: ltr">
                    © 2024 Coin Experts EOOD -
                    <a
                      class="m_-821533581934671015afal"
                      style="
                        font-family: Roboto-Regular, Helvetica, Arial, sans-serif;
                        color: rgba(0, 0, 0, 0.54);
                        font-size: 11px;
                        line-height: 18px;
                        padding-top: 12px;
                        text-align: center;
                      "
                      >Republic of Bulgaria, Sofia 1797, Studentski District, zh.k.
                      Musagenitsa, bl. 91B, entr.A, ap.14</a
                    >
                  </div>
                </div>
              </div>
            </body>
          </html>
          `,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Ошибка отправки письма:', error);
            throw Error(error);
          } else {
            console.log('Письмо успешно отправлено:', info.response);

            const timeEnd = new Date(Date.now() + 600000);

            const data = await temporaryUser.create({
              name: name,
              secondName: secondName,
              email: email,
              phone: phone,
              password: hash,
              code: code,
              timeEnd: timeEnd,
            });

            setTimeout(async () => {
              await temporaryUser.deleteOne({ _id: data._id });
            }, 600000);

            res.status(STATUS.INFO.CREATED).send({
              message: MESSAGE.INFO.CREATED.MAIL,
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

  // ? создает пользователя
  createOne = async (req, res, next) => {
    const { email, code } = req.body;

    // проверка, что это первая регистрация пользователя
    const isFirstRegistration = await user
      .findOne({ email: email })
      .then((data) => {
        if (data) {
          return false;
        } else return true;
      });

    if (!isFirstRegistration) {
      return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.USER));
    }

    await temporaryUser
      .findOne({ email: email })
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.TEMPORARY_USER))
      .then(async (data) => {
        const { _id, attempts } = data;
        // проверка по времени
        if (new Date() >= data.timeEnd) {
          await temporaryUser.deleteOne({ _id: _id });
          return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.TIME_UP));
        }

        // проверка кода
        if (data.code !== code) {
          if (attempts - 1 === 0) {
            await temporaryUser.deleteOne({ _id: _id });
            return next(
              new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.VERIFY_FAILED),
            );
          }

          await temporaryUser.findByIdAndUpdate(_id, {
            attempts: attempts - 1,
          });
          return next(
            new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.EMAIL_CODE),
          );
        }

        await user
          .create({
            name: data.name,
            secondName: data.secondName,
            email: data.email,
            phone: data.phone,
            password: data.password,
          })
          .then(async (userData) => {
            await temporaryUser.deleteOne({ _id: _id });
            if (DEV) {
              res.status(STATUS.INFO.CREATED).send({
                message: MESSAGE.INFO.CREATED.USER,
                data: userData,
              });
            } else {
              res.status(STATUS.INFO.CREATED).send({
                message: MESSAGE.INFO.CREATED.USER,
                data: {
                  name: userData.name,
                  secondName: userData.secondName,
                  email: userData.email,
                  phone: userData.phone,
                  _id: userData._id,
                },
              });
            }
          })
          .catch(next);
      })
      .catch(next);
  };

  // ? создание токена
  _createToken = (data) => jwt.sign(data, this.jwt_secret);

  // ? авторизация пользователя
  login = (req, res, next) => {
    const { email, password } = req.body;
    return user
      .findUserByCredentials(email, password)
      .then((data) => {
        const { _id } = data;
        const token = this._createToken({ _id: _id, isUser: true });

        res.cookie('jwt', token, this.cookie_setting);
        res.send({ message: MESSAGE.INFO.LOGIN });
      })
      .catch((err) => {
        next(err);
      });
  };

  // * PUT
  // ? добавления файла
  addFile = async (req, res, next) => {
    const { _id, isUser } = req.user;
    const { typeOfFile } = req.params;

    // проверка доступа
    if (!isUser) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_USER));
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
      .findByIdAndUpdate(_id, update, options)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((userMe) =>
        res.send({ message: MESSAGE.INFO.PUT.FILE, data: userMe }),
      )
      .catch(next);
  };

  // * PATCH
  // ? изменение данных о пользователе
  patchUserData = async (req, res, next) => {
    const { _id, isUser } = req.user;

    // проверка доступа
    if (!isUser) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_USER));
    }

    const options = { new: true };

    await user
      .findByIdAndUpdate(_id, req.body, options)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((userData) =>
        res.send({ message: MESSAGE.INFO.PATCH.USER, data: userData }),
      )
      .catch(next);
  };

  // * DELETE
  // ? удаление файла
  deleteUserFile = async (req, res, next) => {
    const { _id, isUser } = req.user;
    const { typeOfFile } = req.params;

    // проверка доступа
    if (!isUser) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_USER));
    }

    await user
      .findById(_id)
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

const users = new Users({
  jwt_secret: SERVER_SETTING.JWT_SECRET,
  cookie_setting: {
    expires: new Date(Date.now() + 12 * 3600000),
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  },
});

module.exports = { users };

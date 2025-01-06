// ! modules
const nodemailer = require('nodemailer'); // Для отправки электронной почты

// * errors
const { ForbiddenError } = require('../errors/AllErrors');

// * utils
// ? constants
const { MESSAGE, STATUS, EMAILS } = require('../utils/constants');

class Support {
  // * POST
  // отправка сообщения в поддержку
  sendMail = async (req, res, next) => {
    const { _id, isUser } = req.user;
    const { title, message } = req.body;

    // проверка доступа
    if (!isUser) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_USER));
    }

    const transporter = nodemailer.createTransport({
      service: EMAILS.SERVICE,
      auth: {
        user: EMAILS.SUPPORT.EMAIL, // Ваша Gmail почта
        pass: EMAILS.SUPPORT.PASS, // Пароль от почты
      },
    });

    const mailOptions = {
      from: EMAILS.SUPPORT.EMAIL,
      to: EMAILS.SUPPORT.EMAIL,
      subject: `[${title}] from ${_id}`,
      text: `${message}`,
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
                    ${title}
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
                </div>${message}</div>
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
                    Support mail from user [${_id}]
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

        res.status(STATUS.INFO.CREATED).send({
          message: MESSAGE.INFO.CREATED.SUPPORT_MAIL,
        });
      }
    });
  };

  // отправка сообщения в поддержку без аккаунта
  sendMailByEmail = async (req, res, next) => {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: EMAILS.SERVICE,
      auth: {
        user: EMAILS.SYSTEM.EMAIL, // Ваша Gmail почта
        pass: EMAILS.SYSTEM.PASS, // Пароль от почты
      },
    });

    const mailOptions = {
      to: EMAILS.SYSTEM.EMAIL,
      subject: `New message from [${name}] from [${email}]`,
      text: `${message}`,
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
                    Message from [${name}]
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
                </div>${message}</div>
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
                    Mail to communicate from [${name}]
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

        res.status(STATUS.INFO.CREATED).send({
          message: MESSAGE.INFO.CREATED.SYSTEM_MAIL,
        });
      }
    });
  };
}

const support = new Support();

module.exports = { support };

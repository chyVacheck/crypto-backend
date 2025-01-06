// ! modules
const express = require('express');
const cors = require('cors');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');

// * middlewares
const { handleErrors } = require('./middlewares/handleErrors');

// * api
const api = require('./api/index');

// * utils
// ? utils
const { connectMongo } = require('./utils/utils');
// ? constants
const { SERVER_SETTING } = require('./utils/constants');

// ! app
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://coin-exp.netlify.app'],
    optionsSuccessStatus: 200,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

// api
app.use(api);

// ? валидация ошибок
app.use(errors());
app.use(handleErrors);

// ! function start server
async function start() {
  try {
    // ? подключаемся к серверу mongo
    await connectMongo(SERVER_SETTING.DB_ADDRESS);

    app.listen(SERVER_SETTING.PORT, () => {
      console.log(`App listening on port ${SERVER_SETTING.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();

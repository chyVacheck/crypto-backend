// ! modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// * models
// ? Admin
const admin = require('./../models/Admin');

// * utils
// ? constants
const { SERVER_SETTING } = require('./constants');

// достаем аргументы
const args = process.argv;

// аргументов должно быть больше 2
if (args.length !== 4) {
  console.error('Expected two arguments!');
  process.exit(1);
}

// ? создает владельца
async function createAdmin(login, pass) {
  admin.findOne({ login: login }).then((admin) => {
    if (admin) {
      console.error(
        `There are admin with this login [${login}] try another one\n`,
      );
      process.exit(2);
    }
  });

  bcrypt
    .hash(pass, 10)
    .then((hash) => {
      return admin.create({
        login: login,
        password: hash,
      });
    })
    .then((admin) => {
      console.log(`login: ${admin.login}`);
      console.log('Admin was created');
      process.exit(0);
    });
}

async function start() {
  try {
    mongoose.set('strictQuery', true);
    // ? подключаемся к серверу mongo
    await mongoose.connect(SERVER_SETTING.DB_ADDRESS);
    console.log('Connecting to MongoDB\n');

    // создаем владельца
    createAdmin(args[2], args[3]);
  } catch (error) {
    console.log(error);
  }
}

start();

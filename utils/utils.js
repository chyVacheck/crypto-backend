// ! modules
const mongoose = require('mongoose');

// функция подключения к базе данных по адресу _address_
async function connectMongo(address) {
  mongoose.set('strictQuery', true);
  // ? подключаемся к серверу mongo
  await mongoose.connect(address);
  console.log('Connecting to MongoDB');
}

// возвращает рандомный код
function generateRandomCode(length) {
  let code = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
}

module.exports = { connectMongo, generateRandomCode };

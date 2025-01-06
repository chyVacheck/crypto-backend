// ! modules
const User = require('express').Router();

// * controllers
// ? users
const { users } = require('../controllers/user');

// * middlewares
// ? validation
const Validator = require('./../middlewares/Validation');
// ? multer
const { uploadUserFile } = require('./../middlewares/Multer');

// ? GET
// * получение данных о пользователе
User.get('/me', users.getInfo);

// * получение файла пользователя
User.get('/me/file/:typeOfFile', Validator.usersFile, users.getFile);

// ? PUT
// * добавить файл
User.put(
  '/me/file/:typeOfFile',
  Validator.usersFile,
  uploadUserFile.single('file'),
  users.addFile,
);

// ? PATCH
// * изменить данные
User.patch('/me', Validator.patchUserData, users.patchUserData);

// ? DELETE
// * удалить файл
User.delete('/me/file/:typeOfFile', Validator.usersFile, users.deleteUserFile);

module.exports = User;

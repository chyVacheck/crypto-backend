// ! modules
const Admin = require('express').Router();

// * controllers
// ? users
const { admins } = require('../controllers/admin');

// * middlewares
// ? validation
const Validator = require('./../middlewares/Validation');
// ? multer
const { uploadUserFile } = require('./../middlewares/Multer');

// ? GET
// * получение данных о администраторе
Admin.get('/me', admins.getInfo);

// * получение данных о всех пользователях
Admin.get('/users', admins.getAllUser);

// * получение данных о пользователе по id
Admin.get('/users/:userId', Validator.userId, admins.getUserByUserId);

// * получение файла typeOfFile пользователя по id
Admin.get(
  '/users/:userId/file/:typeOfFile',
  Validator.userIdUsersFile,
  admins.getUsersFileByUserId,
);

// ? POST
// * регистрация
Admin.post('/createOneAdmin', Validator.createOneAdmin, admins.createOne);

// ? PUT
// * добавление файла typeOfFile пользователю по id
Admin.put(
  '/users/:userId/file/:typeOfFile',
  Validator.userIdUsersFile,
  uploadUserFile.single('file'),
  admins.addUsersFileByUserId,
);

// ? PATCH
// * изменение данных пользователя по id
Admin.patch(
  '/users/:userId',
  Validator.patchUserData,
  admins.patchUserDataByUserId,
);

// ? DELETE
// * удалить файл пользователя по его id
Admin.delete(
  '/users/:userId/file/:typeOfFile',
  Validator.userIdUsersFile,
  admins.deleteUserFileById,
);

module.exports = Admin;

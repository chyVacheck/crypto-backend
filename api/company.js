// ! modules
const Company = require('express').Router();

// * controllers
// ? company
const { companies } = require('../controllers/company');

// * middlewares
// ? validation
const Validator = require('./../middlewares/Validation');
// ? multer
const { uploadCompanyFile } = require('./../middlewares/Multer');

// ? GET
// * получить данные о компании по её id
Company.get('/:companyId', Validator.companyId, companies.getCompanyDataById);

// * получить файл компании
Company.get(
  '/:companyId/file/:typeOfFile',
  Validator.companyIdCompanyFile,
  companies.getFileCompanyById,
);

// * получить данные о акционере компании
Company.get(
  '/:companyId/shareholder/:shareholderId',
  Validator.companyIdShareholderId,
  companies.getShareholderByIdCompanyById,
);

// * получить файл акционера компании
Company.get(
  '/:companyId/shareholder/:shareholderId/file/:typeOfFile',
  Validator.companyIdShareholderIdFile,
  companies.getShareholderFileByIdCompanyById,
);

// ? POST
// * создать компанию
Company.post('/', Validator.createCompany, companies.createOne);

// * добавить акционера
Company.post(
  '/:companyId/shareholder',
  Validator.addShareholder,
  companies.addShareholder,
);

// ? PUT
// * добавить файл компании
Company.put(
  '/:companyId/file/:typeOfFile',
  Validator.companyIdCompanyFile,
  uploadCompanyFile.single('file'),
  companies.addFileToCompanyById,
);

// * добавить файл акционеру компании
Company.put(
  '/:companyId/shareholder/:shareholderId/file/:typeOfFile',
  Validator.companyIdShareholderIdFile,
  uploadCompanyFile.single('file'),
  companies.addShareholderFileByIdCompanyById,
);

// ? PATCH
// * обновить данные компании
Company.patch(
  '/:companyId',
  Validator.updateCompanyDataById,
  companies.updateDataById,
);

// * обновить данные акционера компании
Company.patch(
  '/:companyId/shareholder/:shareholderId',
  Validator.companyIdShareholderIdUpdate,
  companies.updateShareholderDataByIdCompanyById,
);

// ? DELETE
Company.delete(
  '/:companyId/shareholder/:shareholderId',
  Validator.companyIdShareholderId,
  companies.deleteShareholderByIdCompanyById,
);

// ? DELETE
Company.delete('/:companyId', Validator.companyId, companies.deleteCompanyById);

module.exports = Company;

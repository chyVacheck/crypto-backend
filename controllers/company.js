// * errors
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} = require('../errors/AllErrors');

// * models
const company = require('../models/Company');
const shareholder = require('../models/Shareholder');
const user = require('../models/User');

// * utils
// ? constants
const { MESSAGE, STATUS, VALID_VALUES, DEV } = require('../utils/constants');

class Companies {
  // * GET
  // ? возвращает данные компании
  getCompanyDataById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId } = req.params;

    await company
      .findById(companyId)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY))
      .then((companyData) => {
        // проверка доступа
        if (!companyData.owners.includes(_id) && !isAdmin) {
          return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
        }

        res.status(STATUS.INFO.OK).send({ data: companyData });
      })
      .catch(next);
  };

  // ? возвращает файл `typeOfFile` компании
  getFileCompanyById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId, typeOfFile } = req.params;

    try {
      const companyData = await company
        .findById(companyId)
        .select(`+${typeOfFile}.data`)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY));

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      // проверка наличия файла
      if (typeof companyData[typeOfFile].data === 'undefined') {
        return next(new NotFoundError(MESSAGE.ERROR.NOT_FOUND.FILE));
      }

      res
        .set('Content-Type', companyData[typeOfFile].type)
        .status(STATUS.INFO.OK)
        .send(companyData[typeOfFile].data);
    } catch (error) {
      return next(error);
    }
  };

  // ? возвращает данные о акционере компании
  getShareholderByIdCompanyById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId, shareholderId } = req.params;

    try {
      const companyData = await company
        .findById(companyId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY));

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      // проверка shareholder
      if (!companyData.shareholders.includes(shareholderId)) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SHAREHOLDER));
      }

      const shareholderData = await shareholder
        .findById(shareholderId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.SHAREHOLDER));

      res.status(STATUS.INFO.OK).send({ data: shareholderData });
    } catch (error) {
      return next(error);
    }
  };

  // ? возвращает файл акционера компании
  getShareholderFileByIdCompanyById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId, shareholderId, typeOfFile } = req.params;

    try {
      const companyData = await company
        .findById(companyId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY));

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      // проверка shareholder
      if (!companyData.shareholders.includes(shareholderId)) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SHAREHOLDER));
      }

      const shareholderData = await shareholder
        .findById(shareholderId)
        .select(`+company.${typeOfFile}.data`)
        .select(`+individual.${typeOfFile}.data`)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.SHAREHOLDER));

      res
        .set(
          'Content-Type',
          shareholderData[shareholderData.typeOfShareholder][typeOfFile].type,
        )
        .status(STATUS.INFO.OK)
        .send(
          shareholderData[shareholderData.typeOfShareholder][typeOfFile].data,
        );
    } catch (error) {
      return next(error);
    }
  };

  // * POST
  // ? создает компанию
  createOne = async (req, res, next) => {
    const { _id, isUser } = req.user;

    // проверка доступа
    if (!isUser) {
      return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.MUST_BE_USER));
    }

    const arrayCompany = await company.find();

    // проверка на то что у пользователя еще нет компании
    for (const oneCompany of arrayCompany) {
      if (oneCompany.owners.includes(_id)) {
        return next(
          new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.ONLY_ONE_COMPANY),
        );
      }
    }

    user.findByIdAndUpdate(_id, { typeOfUser: 'Legal entity' }).catch(next);

    const data = req.body;
    const shareholdersId = [];
    let percentageOfOwnership = 0;

    if (!!data.shareholders) {
      for (const shareholderData of data.shareholders) {
        percentageOfOwnership += shareholderData.percentageOfOwnership;

        if (percentageOfOwnership > 100) {
          return next(
            new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.PERCENT_TO_MUCH),
          );
        }

        await shareholder
          .create({
            percentageOfOwnership: shareholderData.percentageOfOwnership,
            typeOfShareholder: shareholderData.typeOfShareholder,
            [shareholderData.typeOfShareholder]: shareholderData.data,
          })
          .then((newShareholderData) => {
            shareholdersId.push(newShareholderData._id);
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              return next(
                new BadRequestError(MESSAGE.ERROR.INCORRECT_DATA.SIMPLE),
              );
            } else if (err.code === 11000) {
              return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.SIMPLE));
            } else {
              return next(err);
            }
          });
      }
    }

    delete data.shareholders;

    data.owners = [_id];
    data.shareholders = shareholdersId;
    // создание компании
    await company
      .create(data)
      .then((companyData) => {
        res.send({ message: MESSAGE.INFO.CREATED.COMPANY, data: companyData });
        user.findByIdAndUpdate(_id, { companyId: companyData._id }).catch(next);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return next(new BadRequestError(MESSAGE.ERROR.INCORRECT_DATA.SIMPLE));
        } else if (err.code === 11000) {
          return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.SIMPLE));
        } else {
          return next(err);
        }
      });
  };

  // ? добавление инвестора
  addShareholder = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId } = req.params;
    const { data, typeOfShareholder, percentageOfOwnership } = req.body;

    try {
      const companyData = await company.findById(companyId).orFail(() => {
        throw new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY);
      });

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      // должен быть registrationNumber
      if (typeOfShareholder === 'company') {
        const { registrationNumber } = data;

        if (!registrationNumber)
          return next(new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.SIMPLE));

        // находим всех акционеров
        const shareholderCompanies = await shareholder.find({
          typeOfShareholder: 'company',
        });

        // проверка на уникальность registrationNumber
        for (const index in shareholderCompanies) {
          if (
            companyData.shareholders.includes(
              shareholderCompanies[index]._id,
            ) &&
            shareholderCompanies[index].company.registrationNumber ===
              registrationNumber
          ) {
            return next(
              new ConflictError(MESSAGE.ERROR.DUPLICATE.REGISTRATION_NUMBER),
            );
          }
        }
      }

      let totalPercentageOfOwnership = percentageOfOwnership;

      // проверка на суммарное количество процентов
      for (const shareholderId of companyData.shareholders) {
        await shareholder
          .findById(shareholderId)
          .orFail(() => {
            throw new NotFoundError(MESSAGE.ERROR.NOT_FOUND.SHAREHOLDER);
          })
          .then((findShareholderData) => {
            totalPercentageOfOwnership +=
              findShareholderData.percentageOfOwnership;

            if (totalPercentageOfOwnership > 100) {
              throw new BadRequestError(
                MESSAGE.ERROR.BAD_REQUEST.PERCENT_TO_MUCH,
              );
            }
          });
      }

      // Создаем нового инвестора в зависимости от типа инвестора
      const shareholderData = await shareholder
        .create({
          typeOfShareholder,
          percentageOfOwnership,
          [typeOfShareholder]: data,
        })
        .then((shareholderData) => shareholderData);

      companyData.shareholders.push(shareholderData._id); // Добавляем id инвестора в массив shareholder

      await companyData.save(); // Сохраняем изменения в базе данных

      res.status(STATUS.INFO.OK).send({
        message: MESSAGE.INFO.CREATED.SHAREHOLDER,
        data: shareholderData,
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return next(new BadRequestError(MESSAGE.ERROR.INCORRECT_DATA.SIMPLE));
      } else if (error.code === 11000) {
        return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.SIMPLE));
      } else {
        return next(error);
      }
    }
  };

  // * PUT
  // ? добавления файла компании
  addFileToCompanyById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId, typeOfFile } = req.params;

    // наличие файла
    if (!req.file) {
      return next(
        new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.FILE_NOT_UPLOAD),
      );
    }

    const { originalname, mimetype, buffer, size } = req.file;

    // размер файла
    if (size > VALID_VALUES.COMPANY.FILE.SIZE.MAX) {
      return next(
        new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.FILE_TOO_HEAVY),
      );
    }

    const updates = {
      certificateOfIncorporation: {
        name: originalname,
        data: buffer,
        type: mimetype,
      },
    };

    const update = updates[typeOfFile];

    try {
      const companyData = await company
        .findById(companyId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY));

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      companyData[typeOfFile] = update;

      await companyData.save(); // Сохраняем изменения в базе данных

      res.status(200).send({ message: MESSAGE.INFO.PUT.FILE });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return next(new BadRequestError(MESSAGE.ERROR.INCORRECT_DATA.SIMPLE));
      } else if (error.code === 11000) {
        return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.SIMPLE));
      } else {
        return next(error);
      }
    }
  };

  // ? добавления файла акционерам компании
  addShareholderFileByIdCompanyById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId, shareholderId, typeOfFile } = req.params;

    // наличие файла
    if (!req.file) {
      return next(
        new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.FILE_NOT_UPLOAD),
      );
    }

    const { originalname, mimetype, buffer, size } = req.file;

    // размер файла
    if (size > VALID_VALUES.COMPANY.FILE.SIZE.MAX) {
      return next(
        new BadRequestError(MESSAGE.ERROR.BAD_REQUEST.FILE_TOO_HEAVY),
      );
    }

    const files = {
      certificateOfIncorporation: {
        name: originalname,
        data: buffer,
        type: mimetype,
      },
      proofOfAddress: {
        name: originalname,
        data: buffer,
        type: mimetype,
      },
      passport: {
        name: originalname,
        data: buffer,
        type: mimetype,
      },
    };

    const fileData = files[typeOfFile];

    try {
      const companyData = await company
        .findById(companyId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY));

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      // проверка shareholder
      if (!companyData.shareholders.includes(shareholderId)) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SHAREHOLDER));
      }

      const typeOfShareholder = await shareholder
        .findById(shareholderId)
        .then((_data) => _data.typeOfShareholder);

      if (
        !VALID_VALUES.SHARE_HOLDER[
          typeOfShareholder.toUpperCase()
        ].FILE.VALUES.includes(typeOfFile)
      ) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.FILE));
      }

      await shareholder
        .findByIdAndUpdate(
          shareholderId,
          { $set: { [`${typeOfShareholder}.${typeOfFile}`]: fileData } },
          { new: true },
        )
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.SHAREHOLDER))
        .then((newShareholderData) => {
          res.status(STATUS.INFO.OK).send({ message: MESSAGE.INFO.PUT.FILE });
        });
    } catch (error) {
      return next(error);
    }
  };

  // * PATCH
  // ? редактирование данных компании
  updateDataById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId } = req.params;
    const updateFields = req.body;

    try {
      const companyData = await company
        .findById(companyId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY));

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      Object.assign(companyData, updateFields); // Обновляем только переданные поля

      await companyData.save(); // Сохраняем изменения в базе данных

      res.status(STATUS.INFO.OK).send({ message: MESSAGE.INFO.PATCH.COMPANY });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return next(new BadRequestError(MESSAGE.ERROR.INCORRECT_DATA.SIMPLE));
      } else if (error.code === 11000) {
        return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.SIMPLE));
      } else {
        return next(error);
      }
    }
  };

  // ? редактирование данных акционера компании
  updateShareholderDataByIdCompanyById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId, shareholderId } = req.params;
    const updateFields = req.body;

    try {
      const companyData = await company
        .findById(companyId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY));

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      // проверка shareholder
      if (!companyData.shareholders.includes(shareholderId)) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SHAREHOLDER));
      }

      const shareholderData = await shareholder
        .findById(shareholderId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.SHAREHOLDER));

      if (shareholderData.typeOfShareholder === 'company')
        updateFields.registrationNumber =
          shareholderData.company.registrationNumber;

      let totalPercentageOfOwnership = updateFields.percentageOfOwnership;

      // проверка на суммарное количество процентов
      for (const _shareholderId of companyData.shareholders) {
        await shareholder
          .findById(_shareholderId)
          .orFail(() => {
            throw new NotFoundError(MESSAGE.ERROR.NOT_FOUND.SHAREHOLDER);
          })
          .then((findShareholderData) => {
            if (shareholderId !== findShareholderData._id.toString()) {
              totalPercentageOfOwnership +=
                findShareholderData.percentageOfOwnership;
            }

            if (totalPercentageOfOwnership > 100) {
              throw new BadRequestError(
                MESSAGE.ERROR.BAD_REQUEST.PERCENT_TO_MUCH,
              );
            }
          });
      }

      Object.assign(shareholderData, {
        percentageOfOwnership: updateFields.percentageOfOwnership,
        [shareholderData.typeOfShareholder]: updateFields,
      }); // Обновляем только переданные поля

      await shareholderData.save();

      res.status(STATUS.INFO.OK).send({ message: MESSAGE.INFO.PATCH.SIMPLE });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return next(new BadRequestError(MESSAGE.ERROR.INCORRECT_DATA.SIMPLE));
      } else if (error.code === 11000) {
        return next(new ConflictError(MESSAGE.ERROR.DUPLICATE.SIMPLE));
      } else {
        return next(error);
      }
    }
  };

  // * DELETE
  // ? удаление акционера
  deleteShareholderByIdCompanyById = async (req, res, next) => {
    const { _id, isAdmin } = req.user;
    const { companyId, shareholderId } = req.params;

    try {
      const companyData = await company
        .findById(companyId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY));

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      // проверка shareholder
      if (!companyData.shareholders.includes(shareholderId)) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SHAREHOLDER));
      }

      // todo уточнить можно ли удалять последнего shareholder`а
      // проверка количества shareholders
      // if (companyData.shareholders.length === 1) {
      //   return next(
      //     new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.TOO_FEW_SHAREHOLDER),
      //   );
      // }

      await shareholder
        .findByIdAndDelete(shareholderId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.SHAREHOLDER))
        .then(async () => {
          companyData.shareholders = companyData.shareholders.filter(
            (item) => item.toString() !== shareholderId,
          );

          await companyData.save();

          res
            .status(STATUS.INFO.OK)
            .send({ message: MESSAGE.INFO.DELETE.SIMPLE });
        });
    } catch (error) {
      return next(error);
    }
  };

  // ? удаление компании
  deleteCompanyById = async (req, res, next) => {
    const { _id, isAdmin, isUser } = req.user;
    const { companyId } = req.params;

    try {
      const companyData = await company
        .findById(companyId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY));

      // проверка доступа
      if (!companyData.owners.includes(_id) && !isAdmin) {
        return next(new ForbiddenError(MESSAGE.ERROR.FORBIDDEN.SIMPLE));
      }

      await company
        .findByIdAndDelete(companyId)
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.COMPANY))
        .then(async () => {
          if (isUser) {
            await user.findByIdAndUpdate(
              _id,
              {
                $unset: { companyId },
                typeOfUser: 'Juridical person',
              },
              { new: true },
            );
          }

          for (const shareholderId of companyData.shareholders) {
            await shareholder.findByIdAndDelete(shareholderId);
          }

          res
            .status(STATUS.INFO.OK)
            .send({ message: MESSAGE.INFO.DELETE.SIMPLE });
        });
    } catch (error) {
      return next(error);
    }
  };
}

const companies = new Companies();

module.exports = { companies };

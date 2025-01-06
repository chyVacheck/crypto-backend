// * errors
const { TooManyRequests, BadRequestError } = require('../errors/AllErrors');

// * utils
// ? constants
const { API_COINGECKO, MESSAGE } = require('../utils/constants');

class Price {
  constructor(data) {
    this._baseURL = data.baseURL;
  }

  /* получение цен криптовалют
  
    ids: 'bitcoin,usd' // ? ids криптовалюты // ! all для всех
    vs_currencies: 'usd,eth' // ? в какой валюте показывать стоимость // ! all для всех

  */
  getPrices = async (req, res, next) => {
    const { ids, vs_currencies } = req.params;

    const searchOptions = {
      ids: ids,
      vs_currencies: vs_currencies,
    };

    if (ids.toLowerCase() === 'all') {
      searchOptions.ids = API_COINGECKO.IDS.STRING;
    }

    if (vs_currencies.toLowerCase() === 'all') {
      searchOptions.vs_currencies = API_COINGECKO.VS_CURRENCIES.STRING;
    }

    const url = `${this._baseURL}/simple/price?ids=${searchOptions.ids}&vs_currencies=${searchOptions.vs_currencies}`;

    try {
      const result = await fetch(url, {
        method: 'GET',
      });
      if (result.ok) {
        const answer = await result.json();

        res.send(answer);
      } else {
        throw result;
      }
    } catch (err) {
      if (err.status === 429) {
        next(new TooManyRequests(MESSAGE.ERROR.TOO_MANY_REQUESTS.SIMPLE));
      } else {
        next(err);
      }
    }
  };
}

const price = new Price({
  baseURL: API_COINGECKO.BASE_URL,
});

module.exports = { price };

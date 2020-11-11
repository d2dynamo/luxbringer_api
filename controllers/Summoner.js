const debug = require("debug")("test:summoner");
const axios = require("axios");
const { sorter, queryStrings } = require("../helpers");
const { secrets } = require("../config");
const { logger } = require("../util");
const apiKey = secrets.apiKey;

let riotApi = queryStrings.urlGet;

module.exports = {
  generalInfo: async(req, res, next, opt) => {
    try
    {
      let { summonerName, region } = req.body;
      let response = await axios.get(`${riotApi("summoner", region)}${summonerName}?api_key=${apiKey}`)

      res.status(200).json
      ({
        data:
        {
          message: response.data,
          summonerName: response.data.name,
          summonerIconId: response.data.profileIconId,
          summonerLevel: response.data.summonerLevel
        }

      });

    }
    catch(e){next(e);}
  }
  
};

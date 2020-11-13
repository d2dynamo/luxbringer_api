const debug = require("debug")("test:summoner");
const axios = require("axios");
const { sorter, queryStrings } = require("../helpers");
const { secrets } = require("../config");
const { logger } = require("../util");
const apiKey = secrets.apiKey;

let riotApi = queryStrings.urlGet;

module.exports = {
  generalInfo: async(req, res, next) => {
    try
    {
      let { summonerName, region } = req.body;

      let summonerData = await axios.get(`${riotApi("summoner", region)}${summonerName}?api_key=${apiKey}`);
      let summonerRankedData = await axios.get(`${riotApi("summoner_rank", region)}${summonerData.data.id}?api_key=${apiKey}`)
      //Sort out ranks
      let ranks = await sorter.rankData(summonerRankedData.data);
      
      res.status(200).json
      ({
        data:
        {
          summonerName: summonerData.data.name,
          summonerIconId: summonerData.data.profileIconId,
          summonerLevel: summonerData.data.summonerLevel,
          soloQRank: `${ranks.soloduo.rank} ${ranks.soloduo.lp}lp`,
          soloQWinrate: ranks.soloduo.winRate
        }

      });

    }
    catch(e){next(e)}
  }
  
};

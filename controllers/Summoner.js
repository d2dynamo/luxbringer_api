const debug = require("debug")("test:summoner");
const axios = require("axios");
const { sorter, queryStrings } = require("../helpers");
const { secrets } = require("../config");
const { logger } = require("../util");
const apiKey = secrets.apiKey;

let riotApi = queryStrings.urlGet;

function capitalize(str){
  if(typeof(str) !== "string"){ throw new TypeError("must be a string") }

  else
  {
    let a = str.substr(0, 1).toUpperCase();
    let b = str.substr(1);

    return a+b;
  }
}

module.exports = {
/**
 * 
 * @param {String} summonerName 
 * @param {String} region 
 * @returns basic summoner data
 */
generalInfo: async(summonerName, region) => 
{
  try
  {
    //Get summoner data
    let summonerData = await axios.get(`${riotApi("summoner", region)}${summonerName}?api_key=${apiKey}`);
    let summonerRankedData = await axios.get(`${riotApi("summoner_rank", region)}${summonerData.data.id}?api_key=${apiKey}`);
    let summonerMasteries = await axios.get(`${riotApi("summoner_masteries", region)}${summonerData.data.id}?api_key=${apiKey}`);
    //Sort out ranks
    let ranks = await sorter.rankData(summonerRankedData.data);
    
    //sort summoner data
    let data =
    {
      summonerName: summonerData.data.name,
      summonerIconId: summonerData.data.profileIconId,
      summonerLevel: summonerData.data.summonerLevel,
      soloQRank: `${ranks.soloduo.rank} ${ranks.soloduo.lp}lp`,
      soloQWinrate: ranks.soloduo.winRate,
      topChampion: 
      {
        name: await sorter.championName(summonerMasteries.data[0].championId),
        masteryLevel: summonerMasteries.data[0].championLevel,
        masteryPoints: summonerMasteries.data[0].championPoints,
      }
    }
    //return summoner data
    return(data)
  }
  catch(e){throw e}
},


/**
 * 
 * @param {String} summonerName 
 * @param {String} region 
 * @param {Object} query
 *  query.type: type of gamemode to search for, defaults to "ranked solo" | String
 *  query.amount: amount of games to search for, defaults to 1 | Int64
 * @returns Matchlist with simple stats
 */
matches: async(summonerName, region, query) => 
{
  try
  {

    //limit amount of games to retrieve up to 5
    if(query.amount > 5){ query.amount = 5}


    //if query contains a requested quetype
    if(query.type)
    {
      //send requested queue name trough the sorter
      let qTypes = await sorter.findQueueIds(query.type);

      //if no quetypes found, respond with 404 and return to stop execution.
      if(qTypes.length === 0){ throw({status: 404, message: "queue type not found"}); }

      //create the queue query params
      var queueTypeParams = ``;
      qTypes.forEach( item => { queueTypeParams += `&queue=${item}` })
    }
    

    //get summonerdata
    let summonerData = await axios.get(`${riotApi("summoner", region)}${summonerName}?api_key=${apiKey}`);
    let summonerMatches = await axios.get(   
      //Check if request includes query parameters and pass them (amount of games defaults to 1)
      `${riotApi("summoner_match_list", region)}${summonerData.data.accountId}?endIndex=${query.amount ? query.amount : 1}${queueTypeParams ? queueTypeParams : ""}&api_key=${apiKey}`
    );
    

    //matchlist that will be returned
    let matchList = new Array();
    //sort each match's data
    for(const item of summonerMatches.data.matches)
    {
      //get match stats
      let matchStats = await axios.get(`${riotApi("match_stats", region)}${item.gameId}?api_key=${apiKey}`)
      debug("matchstats", matchStats.data)
      //send each match's stats trough sorter and push to list
      matchList.push(
        {
          queue: await sorter.findQueueName(item.queue),
          champion: await sorter.findChampionName(item.champion),
          stats: await sorter.matchData(matchStats.data, summonerName)
        }
      )
    }

    return( data = {summonerName, matchList} )
    
  }
  catch(e){throw e}
}
  
};

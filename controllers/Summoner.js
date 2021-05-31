const axios = require("axios");
const { sorter, queryStrings } = require("../helpers");
const { secrets } = require("../config");
const apiKey = secrets.apiKey;

const riotApi = queryStrings.urlGet;

module.exports = {
/**
 * 
 * @param {string} summonerName 
 * @param {string} region 
 * @returns basic summoner data
 */
generalInfo: async(summonerName, region, topChamps = 3) => 
{
  try
  {
    //Get summoner data
    let summonerData = await axios.get(`${riotApi("summoner", region)}${summonerName}?api_key=${apiKey}`);
    let summonerRankedData = await axios.get(`${riotApi("summoner_rank", region)}${summonerData.data.id}?api_key=${apiKey}`);
    let summonerMasteries = await axios.get(`${riotApi("summoner_masteries", region)}${summonerData.data.id}?api_key=${apiKey}`);

    //Sort out ranks
    let ranks = await sorter.rankData(summonerRankedData.data);
    
    if(summonerMasteries.data.length === 0){ summonerMasteries.data.push(
      {
        championId: 0,
        championLevel: 0,
        championPoints: 0,
        lastPlayTime: 0,
        championPointsSinceLastLevel: 0,
        championPointsUntilNextLevel: 0,
        chestGranted: false,
        tokensEarned: 0,
        summonerId: 'unknown'
      },
    )}

    //sort summoner data
    let data =
    {
      summonerName: summonerData.data.name,
      summonerIconId: summonerData.data.profileIconId,
      summonerLevel: summonerData.data.summonerLevel,
      soloQRank: `${ranks.soloduo.rank} ${ranks.soloduo.lp}lp`,
      soloQWinrate: ranks.soloduo.winRate,
      //Get top three champions, riot api sorts champion mastery array from highest mastery to lowest
      //And since we need to use a helper to find champion name, use Promise.all to wrap all returned items with promises into one promise.
      topChampions: await Promise.all(
        summonerMasteries.data.slice(0, topChamps).map(async(item) => {
          return {
            name: await sorter.findChampionName(item.championId),
            masteryLevel: item.championLevel,
            masteryPoints: item.championPoints
          }
        })
      )
      }
    //return summoner data
    return(data)
  }
  catch(e){throw e}
},


/**
 * 
 * @param {string} summonerName 
 * @param {string} region 
 * @param {string} queueType queue type. ex: solo, aram, urf
 * @param {number} amount amount of games to look for max 6
 * @returns Matchlist with simple stats
 */
matches: async(summonerName, region, queueType, amount) => 
{
  try
  {
    //limit amount of games to retrieve up to 6
    if(amount > 6){ amount = 6}


    //if query contains a requested quetype
    if(queueType)
    {
      //send requested queue name trough the sorter
      let qTypes = await sorter.findQueueIds(queueType);

      //if no quetypes found, respond with 404 and return to stop execution.
      if(qTypes.length === 0){ throw({status: 404, message: "queue type not found"}); }

      //create the queue query string and append the queue ids
      var queueTypeParams = ``;
      qTypes.forEach( item => { queueTypeParams += `&queue=${item}` })
    }
    

    //get summonerdata
    let summonerData = await axios.get(`${riotApi("summoner", region)}${summonerName}?api_key=${apiKey}`);
    let summonerMatches = await axios.get(
      //Check if amount and queueTypes included
      `${riotApi("summoner_match_list", region)}${summonerData.data.accountId}?endIndex=${amount}${queueTypeParams ? queueTypeParams : ""}&api_key=${apiKey}`
    );


    //matchlist that will be returned
    let matchList = new Array();
    //sort each match's data
    for(const item of summonerMatches.data.matches)
    {
      //get match stats
      let matchStats = await axios.get(`${riotApi("match_stats", region)}${item.gameId}?api_key=${apiKey}`)

      //send each match's stats trough sorter and push to list
      matchList.push(
        {
          queue: await sorter.findQueueName(item.queue),
          champion: await sorter.findChampionName(item.champion),
          stats: await sorter.matchData(matchStats.data, summonerName)
        }
      )
    }

    return {summonerName, matchList}
    
  }
  catch(e){throw e}
}
  
};

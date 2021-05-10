const debug = require("debug")("test:summoner");
const { logger } = require("../util");
const sorter = require("../helpers/sorter");

module.exports = 
{
/**
 * 
 * @param {*} championName 
 * @returns Simple champion data object
 */
generalInfo: async(championName) => 
{
    try{
        //sort champion data
        let data = await sorter.championDataSimple( championName );

        return({ data })
    } catch(e){ throw e }
},

/**
 * 
 * @param {*} championName 
 * @returns Detailed champion data
 */
detailedInfo: async(championName) => 
{
    try{
        //sort champion data
        let data = await sorter.championData( championName );

        return({ data })
    } catch(e){ throw e }
}

}
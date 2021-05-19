const debug = require("debug")("test:summoner");
const { logger } = require("../util");
const sorter = require("../helpers/sorter");

module.exports = 
{
/**
 * 
 * @param {string} championName 
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
 * @param {string} championName 
 * @returns Full champion data
 */
// detailedInfo: async(championName) => 
// {
//     try{
//         //sort champion data
//         let data = await sorter.championData( championName );

//         return({ data })
//     } catch(e){ throw e }
// }

}
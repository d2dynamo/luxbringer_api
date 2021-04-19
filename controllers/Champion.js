const debug = require("debug")("test:summoner");
const { logger } = require("../util");
const sorter = require("../helpers/sorter");

module.exports = 
{

generalInfo: async(req, res, next) => 
{
    try{
        let { championName } = req;

        //sort champion data
        let champion = await sorter.championDataSimple( championName );

        res.status(200).json(
        {
            data: {
                champion
            }
        });
    } catch(e){ next(e) }
},
detailedInfo: async(req, res, next) => 
{
    try{
        let { championName } = req;

        //sort champion data
        let champion = await sorter.championData( championName );

        res.status(200).json(
        {
            data: {
                champion
            }
        });
    } catch(e){ next(e) }
}

}
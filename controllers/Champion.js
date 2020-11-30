const debug = require("debug")("test:summoner");
const { logger } = require("../util");
const sorter = require("../helpers/sorter");

const { data } = require("../datadragon/10.23.1/data/en_US/champion.json")
const { data: dataFull } = require("../datadragon/10.23.1/data/en_US/championFull.json")

module.exports = 
{

generalInfo: async(req, res, next) => 
{
    try{
        let { championName } = req;

        //return 404 if champion doesnt exist
        if(!data.hasOwnProperty(championName)){ res.status(400).send("Champion not found"); return; }

        //sort champion data
        let champion = await sorter.championDataSimple( data[championName] );

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

        //return 404 if champion doesnt exist
        if(!dataFull.hasOwnProperty(championName)){ res.status(400).send("Champion not found"); return; }

        //sort champion data
        let champion = await sorter.championData( dataFull[championName] );

        res.status(200).json(
        {
            data: {
                champion
            }
        });
    } catch(e){ next(e) }
}

}
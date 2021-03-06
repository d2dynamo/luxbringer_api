const express = require('express');
const router = express.Router();
const { SimpleController, Summoner, Item, Champion} = require("../controllers");


router.all('/', (req, res, next) => { SimpleController.basicEndpoint(req, res, next); });

router.get("/lux/summoner", (req, res, next) => {
    //validate for summoner name and region
    if( !req.body.summonerName && !req.query.summonerName ){ next(new TypeError("must provide summonerName. ex: /lux/summoner?summonerName=faker&region=kr")) }

    let summonerName = req.query.summonerName || req.body.summonerName;
    let region = req.query.region || req.body.region || "euw";

    Summoner.generalInfo(summonerName, region)
    .then(data => { res.status(200).send(data); })
    .catch( e => next(e) )
 });

router.get("/lux/summoner/match", (req, res, next) => { 
    if( !req.body.summonerName && !req.query.summonerName ){ next(new TypeError("must provide summonerName. ex: /lux/summoner?summonerName=faker&region=kr")) }

    let summonerName = req.query.summonerName || req.body.summonerName;
    let region = req.query.region || req.body.region || "euw";
    let queueType = req.query.queueType || req.body.queueType || null;
    let amount = req.query.amount || req.body.amount || 1;

    Summoner.match(summonerName, region, queueType, amount)
    .then(data => { res.status(200).send(data); })
    .catch( e => next(e) )
});

router.get("/lux/item", (req, res, next) => {
    if(!req.body.itemName && !req.query.itemName){ next(new TypeError("must provide itemName. ex: /lux/item?itemName=bork")) }

    Item.generalInfo(req.query.itemName || req.body.itemName)
    .then(data => { res.status(200).send(data); })
    .catch( e => next(e) )
});

router.get("/lux/item/detailed", (req, res, next) => { 
    if(!req.body.itemName && !req.query.itemName){ next(new TypeError("must provide itemName. ex: /lux/item?itemName=bork")) }

    Item.detailedInfo(req.query.itemName || req.body.itemName)
    .then(data => { res.status(200).send(data); })
    .catch( e => next(e) ) 
});

router.get("/lux/champion", (req, res, next) => {
    if(!req.body.championName && !req.query.championName){ next(new TypeError("must provide championName. ex: /lux/champion?championName=jhin")) }

    Champion.generalInfo(req.query.championName || req.body.championName)
    .then(data => { res.status(200).send(data); })
    .catch( e => next(e) )
});


// router.get("/lux/champion/detailed", (req, res, next) => { 
//     if(!req.body.championName){ next(new TypeError("must provide championName in request body")) }

//     Champion.detailedInfo(championName)
//     .then(data => { res.status(200).send(data); })
//     .catch( e => next(e) )
// });

module.exports = router;
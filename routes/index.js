const express = require('express');
const router = express.Router();
const { SimpleController, Summoner, Item, Champion} = require("../controllers");


router.all('/', (req, res, next) => { SimpleController.basicEndpoint(req, res, next); });

router.get("/lux/summoner", (req, res, next) => {
    //validate for summoner name and region
    if( !req.body.summonerName && !req.query.summonerName ){ next(new TypeError("must provide summonerName. ex: /lux/summoner?summonerName=faker&region=kr")) }

    let summonerName = req.body.summonerName || req.query.summonerName;
    let region = req.body.region || req.query.region || "euw";

    Summoner.generalInfo(summonerName, region)
    .then(data => { res.status(200).send(data); })
    .catch( e => next(e) )
 });

router.get("/lux/summoner/matches", (req, res, next) => { 
    if( !req.body.summonerName && !req.query.summonerName ){ next(new TypeError("must provide summonerName. ex: /lux/summoner?summonerName=faker&region=kr")) }

    let summonerName = req.body.summonerName || req.query.summonerName;
    let region = req.body.region || req.query.region || "euw";
    let queueType = req.body.queueType || req.query.queueType || null;
    let amount = req.body.amount || req.query.amount || 3;

    Summoner.matches(summonerName, region, queueType, amount)
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
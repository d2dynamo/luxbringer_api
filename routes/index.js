const express = require('express');
const router = express.Router();
const { SimpleController, Summoner, Item, Champion} = require("../controllers");


router.all('/', (req, res, next) => { SimpleController.basicEndpoint(req, res, next); });

router.get("/lux/summoner", (req, res, next) => { 
    //validate for summoner name and region
    if(!req.body.summonerName || !req.body.region){ next(new TypeError("must provide a summonerName and region in request body")) }

    Summoner.generalInfo(req.body.summonerName, req.body.region)
    .then(data => { res.status(200).send(data); })
    .catch( e => next(e) )
 });

router.get("/lux/summoner/matches", (req, res, next) => { 
    if(!req.body.summonerName || !req.body.region || req.body.query){ next(new TypeError("must provide summonerName, region and query in request body")) }
    
    Summoner.matches(req.body.summonerName, req.body.region, req.body.query)
    .then(data => { res.status(200).send(data); })
    .catch( e => next(e) )
});

router.get("/lux/item", (req, res, next) => {
    if(!req.body.itemName){ next(new TypeError("must provide itemName in request body")) }

    Item.generalInfo(req.body.itemName)
    .then(data => { res.status(200).send(data); })
    .catch( e = next(e) )
});

router.get("/lux/item/detailed", (req, res, next) => { 
    if(!req.body.itemName){ next(new TypeError("must provide itemName in request body")) }

    Item.detailedInfo(req.body.itemName)
    .then(data => { res.status(200).send(data); })
    .catch( e => next(e) ) 
});

router.get("/lux/champion", (req, res, next) => {
    if(!req.body.championName){ next(new TypeError("must provide championName in request body")) }

    Champion.generalInfo(req.body.championName)
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
const express = require('express');
const router = express.Router();
const { SimpleController, Summoner, Item, Champion} = require("../controllers");


router.all('/', (req, res, next) => { SimpleController.basicEndpoint(req, res, next); });

router.get("/lux/summoner", (req, res, next) => { Summoner.generalInfo(req, res, next); });

router.get("/lux/summoner/matches", (req, res, next) => { Summoner.matches(req, res, next); });

router.get("/lux/item", (req, res, next) => { Item.generalInfo(req, res, next); });

router.get("/lux/item/detailed", (req, res, next) => { Item.detailedInfo(req, res, next); });

router.get("/lux/champion", (req, res, next) => { Champion.generalInfo(req, res, next); })



module.exports = router;
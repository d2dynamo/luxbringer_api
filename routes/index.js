const express = require('express');
const router = express.Router();
const { SimpleController, Summoner, Item} = require("../controllers");


router.all('/', (req, res, next) => { SimpleController.basicEndpoint(req, res, next); });

router.get("/lux/summoner", (req, res, next) => { Summoner.generalInfo(req, res, next); });

router.get("/lux/item", (req, res, next) => { Item.generalInfo(req, res, next); });



module.exports = router;
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");
const {logger, userLogger, downloadFile} = require("./util");
const { checkIfUpdating } = require("./middleware");
const router = require("./routes");

//import datadragon updater which also starts the cron schedule
const { cronDatadragonUpdater } = require("./util");

//ensure that datadragon manifest is available and pass current datadragon version to a global var
const ddManifest = require("./datadragon/manifest.json");
global.DATADRAGON_VERSION = ddManifest.v;

//download queues json which should not be neccesary to do with every update
downloadFile("http://static.developer.riotgames.com/docs/lol/queues.json", "./datadragon/queues.json")
.then(() => { logger.info({message: "queues.json downloaded"}) })
.catch((error) => { logger.error({message: `failed to download queues.json \n${error}`}) })

//set cors
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"]
}


//Set up middleware\\
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors(corsOptions));
//enable preflight
app.options("*", cors());


//Request handling\\
//check if datadragon files are updating before serving from datadragon dependant endpoint
app.use("/lux", checkIfUpdating);

//log requests
app.use("", (req, res, next) => {
  userLogger.verbose({message: `New ${req.method} request`, headers:req.headers, body:req.body, origin: req.hostname}); 
  next();
})

//send to router
app.use("", router);

//on page not found
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

//on error, default status to internal failure
app.use((error, req, res, next) => 
{

  //if error status 400-499, log as user error.
  if( [...Array(100).keys()].map(i => i + 400).includes(error.status) ){
      userLogger.error({status: error.status, message: error.message, headers: req.headers, body: req.body, origin: req.hostname});
  }

  else{ //log server errors
      logger.error({message:error.message});
  }

  res.status(error.status || 500)
  .json({
    error: {
      message: error.message
    }
  });

}
);

logger.info({message:"API Started"});

module.exports = app;
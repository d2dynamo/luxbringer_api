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

  //if a request was sent to another api but it responded with non 2XX status code
  if(error.response){
    if( [...Array(100).keys()].map(i => i + 400).includes(error.response.status) ){
      userLogger.error({ 
        status: error.response.status,
        message: JSON.stringify(error.response.data),
        headers: req.headers, body: req.body, origin: req.hostname
      });
    }

    else{
      logger.error(JSON.stringify(error.response.data))
    }

    res.status(error.response.status || 500)
    .json({
      message: error.response.data
    });
  }

  //if a request was sent to another api but no response
  else if(error.request){ 
    logger.error(error.request)

    res.status(error.status || 500)
    .json({
      message: error.request
    });

  }

  //otherwise its an error from this server
  else{
    //if error status 400-499, log as user error with user request 
    if( error.status && [...Array(100).keys()].map(i => i + 400).includes(error.status) ){
      userLogger.error({status: error.status, message: error.message, headers: req.headers, body: req.body, origin: req.hostname});
    }

    else{ //log server errors
      logger.error(error.stack);
    }

    res.status(error.status || 500)
    .json({
      message: error.message
    });
  }

}
);

logger.info({message:"API Started"});

module.exports = app;
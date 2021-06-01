require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");
const {logger, userLogger, downloadFile} = require("./util");
const { checkIfUpdating } = require("./middleware");
const router = require("./routes");
const fs = require("fs-extra");

//import datadragon updater which also starts the cron schedule
const { cronDatadragonUpdater } = require("./util");

//check if datadragon exists and run updater if not
if(!fs.pathExistsSync("./datadragon/manifest.json")){
  const { DatadragonUpdater } = require("./util");
  DatadragonUpdater()
  .then(sucess => {
    if(sucess){logger.info("datadragon sucessfully downloaded on first run")}
  })
  .catch(e => logger.error(e.trace || e.message))
}
//assign local datadragon version to global variable if there are datadragon files
else{
  const ddManifest = fs.readJsonSync("./datadragon/manifest.json");
  global.DATADRAGON_VERSION = ddManifest.v;
  logger.info(`local datadragon version ${DATADRAGON_VERSION}`)
}


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

    //check if reponse.data has a status property which is what riot responds with on 404 responses and send the message thats inside of it
    res.status(error.response.status || 500)
    .json({
      message: (error.response.data.status ? error.response.data.status.message : error.response.data)
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
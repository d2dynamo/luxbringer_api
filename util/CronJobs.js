const debug = require("debug")("test:CronJobs");
const cron = require("node-cron");
const DatadragonUpdater = require("./DatadragonUpdater");
const { logger } = require("./Loggers");

module.exports = {
    cronDatadragonUpdater: cron.schedule("0 3 * * 1-7", () => {
        logger.info({message:`cronDatadragonUpdater started.`})
        DatadragonUpdater()
        .then((success) => {
            if(!success){ logger.error({message:`cronDatadragonUpdater got false from DatadragonUpdater. Strange error, shouldn't happen!`}); return;}
            else{logger.info({message:"Datadragon succesfully updated!"})}
        }) 
        .catch( error => { logger.error({message:`cronDatadragonUpdater failed! \n${error}`}) })
    })
}
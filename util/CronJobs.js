const cron = require("node-cron");
const DatadragonUpdater = require("./DatadragonUpdater");
const { logger } = require("./Loggers");

module.exports = {
    cronDatadragonUpdater: cron.schedule("0 3 * * 1-7", () => {
        logger.info({message:`cronDatadragonUpdater scheduled task running.`})
        DatadragonUpdater()
        .then((success) => {
            //success = false means local datadragon is latest
            if(!success){ logger.info({message:`Datadragon is already up-to-date.`}); return; }
            else{ logger.info({message:"Datadragon succesfully updated!"}); return; }
        }) 
        .catch( error => { logger.error({message:`cronDatadragonUpdater failed! \n${error}`}) })
    })
}
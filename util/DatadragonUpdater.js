const debug = require("debug")("test:ddUpdater");
const axios = require("axios");
const fs = require("fs-extra");
const tar = require("tar");
const { logger } = require("./Loggers");
const downloadFile = require("./Downloader.js");

module.exports = function DatadragonUpdater()
{
function doUpdate(newVersion){
return new Promise((resolve) => {
    fs.ensureDir("./temp/datadragon")
    .then(() => {

        logger.info({message:"Downloading new datadragon"});
        return downloadFile(`https://ddragon.leagueoflegends.com/cdn/dragontail-${newVersion}.tgz`, `./temp/dragontail-${newVersion}.tgz`);

    })
    .then(() => {

        logger.info({message:"New datadragon downloaded. Extracting files."});
        return tar.x( { file: `./temp/dragontail-${newVersion}.tgz`, cwd: "./temp/datadragon/" }, 
        [
            `${newVersion}/manifest.json`, `${newVersion}/data/en_US`, `${newVersion}/img/champion`, `${newVersion}/img/item`, `${newVersion}/img/passive`, 
            `${newVersion}/img/profileicon`, `${newVersion}/img/spell`, `img/champion/tiles`, `img/perk-images`
        ]);
        

    })
    .then(() => {

        logger.info({message:"New files extracted. Moving files from /temp to /datadragon"});
        //fs-extra.move for some reason gives 'EPERM: operation not permitted, rename:' 
        //error on move operation for "./temp/datadragon" to "./datadragon"
        //i have tested other directories and be they empty or not, move operation would work
        //i suspect fs-extra.move might not like moving folders with a numeric name such as "./temp/datadragon/10.21.1" 
        //and i cant be bothered right so now sticking with fs-extra.copy for now 
        return fs.copy("./temp/datadragon", "./datadragon", {overwrite: true});
    })
    .then(() => {
        //move manifest to root datadragon folder for easy access
        return fs.move(`./datadragon/${newVersion}/manifest.json`, "./datadragon/manifest.json")
    })
    .then(() => {
        //delete temp files
        return fs.rm("./temp", {recursive:true})
    })
    .then(() => {
        logger.info({message:`Datadragon updated to latest. v${newVersion}`});
        resolve(true);
    })
    .catch(error => { throw error })
})
}

return new Promise((resolve, reject) => {
    logger.info("Running datadragon updater")
    //Write temporary file to show that datadragon is updating. 
    //"Checker" middleware checks for updating.txt before letting trough requests to datadragon dependant endpoints.
    fs.writeFileSync("./temp/updating.txt")

    let newVersion;

    axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
    .then((response) => {
        //Get latest version and check if manifest.json exists
        newVersion = response.data[0];
        return fs.pathExists("./datadragon/manifest.json");
    })
    .then((exists) => {
        if(!exists){
            logger.info("manifest.json missing, assuming datadragon files are missing. Updating datadragon.")
            resolve(doUpdate(newVersion));
        }
        else{
            fs.readJSON("./datadragon/manifest.json")
            .then((obj) => {
                logger.info({message:`local datadragon version: ${obj.v}. Latest datadragon version: ${newVerison}`})
                //Reject if version is latest, do update if not
                if(obj.v == newVersion){
                    //Remove the temporary file so datadragon dependant endpoints can now be reached (doUpdate() does this by itself)
                    fs.rm("./temp/updating.txt")
                    .then(() => { reject("datadragon is up-to-date") }) 
                }
                else{ resolve(doUpdate(newVersion)) }
            })
        }
    })
    .catch(error => { throw error })

})

}
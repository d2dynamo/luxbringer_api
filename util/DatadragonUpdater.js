const cron = require("node-cron");
const axios = require("axios");
const fs = require("fs-extra");
const tar = require("tar");
const { logger } = require("./Loggers");
const downloadFile = require("./Downloader.js");

//run datadragon updater every second day at 03:10 AM
module.exports = cron.schedule("10 3 * * 1,3,5,7", 
async() => 
{
    try{
        fs.readdir("./datadragon", async(error, files) => {
            if(error){throw error}

            logger.info({message:"checking for datadragon update"});

            //get local datadragon version (assuming that nothing else touches this directory)
            let localver = files[0];
            
            //get latest datadragon version
            let response = await axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`);
            let newver = response.data[0];
            
            logger.info({message:`local datadragon: ${localver}. current datadragon: ${newver}.`});

            if(newver === localver){ logger.info({message: "local datadragon up-to-date"}); return; } 
      
            //if local datadragon version is outdated
            else{
                //create updating.txt file which is used to check if datadragon is being updated before
                //serving from datadragon dependant endpoints. at middleware/Checker.js
                fs.writeFile("./temp/updating.txt", "files updating")
                .then(logger.info({message: `updating datadragon ${localver} to ${newver}`}))
                .catch(e => {throw e})

                //download latest datadragon tarball
                downloadFile(`https://ddragon.leagueoflegends.com/cdn/dragontail-${newver}.tgz`, `./temp/dragontail-${newver}.tgz`)
                .then(() => {
                
                    logger.info({message: "new datadragon downloaded"});
        
                    //extract files to temp directory
                    tar.x( 
                    {
                        file: `./temp/dragontail-${newver}.tgz`, cwd: "./temp/datadragon/"
                    }, 
                    [
                        `${newver}/data/en_US`, `${newver}/img/champion`, `${newver}/img/item`, `${newver}/img/passive`, 
                        `${newver}/img/profileicon`, `${newver}/img/spell`, `img/champion/tiles`, `img/perk-images`
                    ], 
                    (error) => {

                        if(error){throw error}

                        logger.info({message: "new datadragon extracted"});
            
                        //remove local datadragon
                        fs.rmdir("./datadragon", {recursive: true})
                        .then(() => {
            
                            //copy new datadragon from temp to root
                            fs.copy(`./temp/datadragon/`, `./datadragon/`)
                            .then(() => {
                                logger.info({message: "local datadragon replaced with new datadragon"});
                                
                                //remove temp files
                                //rmdir cannot remove just the content of directory so must delete the entire tree
                                //and must mkdir again otherwise downloader and tar will crash when directory doesnt exist
                                //TODO: Update node to 14.14.0+ and use fs.rm which could remove just the content and leave directory
                                //...or just get directory names and remove them accordingly?
                                fs.rmdir(`./temp`, {recursive: true})
                                .then(() => {
                                    logger.info({message: "temp files deleted"});
                                    
                                    //make temp dir
                                    fs.mkdir(`./temp/datadragon`, {recursive: true})
                                    .then(() => {
                                        logger.info({message: "datadragon updated"});
            
                                    }).catch(e => {throw e})
                                }).catch(e => {throw e})
                            }).catch(e => {throw e})
                        }).catch(e => {throw e});

                    })

                }).catch(e => {throw e});
      
            }
        });

    } 
    catch(error){ fs.removeSync("./temp/updating.txt"); logger.error({status:500, message:error}); }
});

// check for new datadragon version every second day at 03:00 local time


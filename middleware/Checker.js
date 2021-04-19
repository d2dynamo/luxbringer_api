const fs = require("fs-extra");

module.exports = function checkIfUpdating(req, res, next)
{
    fs.readdir("./temp")
    .then(files => {
        if( files.indexOf("updating.txt") !== -1 ){
            res.status(503).json({message: "server updating data files, try again in a few minutes"});
        }
        else{ next() }
        
    })
    .catch(error => {next(error)})
}

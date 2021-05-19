const fs = require("fs-extra");

module.exports = function checkIfUpdating(req, res, next)
{
    fs.pathExists("./temp/updating.txt")
    .then(exists => {
        if(exists){
            res.status(503).json({message: "server updating data files, try again in a few minutes"});
        }
        else{ next() }
        
    })
    .catch(error => {next(error)})
}

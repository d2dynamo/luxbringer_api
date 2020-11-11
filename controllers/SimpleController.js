module.exports = {
    basicEndpoint: async(req, res, next) => {
        try
        {
            let message = `${req.body.message == "hello there" ? "General kenobi, y" : "Y"}ou have accessed the ${req.originalUrl} route. Im just a simple endpoint, have a nice day.`

            res.status(200).json({ message, clientReq:{headers: req.headers, body:req.body} });
        }
        catch(e){next(e)}
    }
}
const debug = require("debug")("test:ItemsController");
const { sorter, queryStrings } = require("../helpers");
const { secrets } = require("../config");
const { logger } = require("../util");
const apiKey = secrets.apiKey;
const itemStore = require("../datadragon/10.1.1/data/en_US/item.json");

//destruct the items object
let { data: items } = itemStore;

module.exports = {
    generalInfo: async(req, res, next) => {
        try
        {
          let { itemName } = req.body;
          
          //find item id, return 404 if item not found (return; to stop function from executing further)
          let itemId = await sorter.findItemId(itemName);
          if(itemId === "not found"){ res.status(404).send("not found"); return; }

          //get the parsed item
          let parsedItem = await sorter.itemData(itemId);
          res.status(200).json
          ({
            item: parsedItem
          });

        }
        catch(e){ next(e); }
    },
}
const debug = require("debug")("test:ItemsController");
const fs = require("fs-extra");
const { sorter, queryStrings } = require("../helpers");
const { secrets } = require("../config");
const { logger } = require("../util");
const apiKey = secrets.apiKey;

module.exports = {
  /**
   * 
   * @param {*} itemName
   * @returns Simple item data
   */
    generalInfo: async(itemName) => {
        try
        {
          let { data: items} = await fs.readJson(`../datadragon/data/en_US/item.json`);
          
          //find item id, return 404 if item not found (return; to stop function from executing further)
          let itemId = await sorter.findItemId(itemName);
          if(itemId === "not found"){ throw {status: 404, message: `Item '${itemName}' not found`} }

          //send the item trough the parser
          let parsedItem = await sorter.itemDataSimple(items[itemId]);

          return( {item: parsedItem} )

        }
        catch(e){ throw e }
    },
    detailedInfo: async(req, res, next) => {
      try
      {
        let { data: items} = await fs.readJson(`../datadragon/data/en_US/item.json`);


        let { itemName } = req.body;
        
        
        let itemId = await sorter.findItemId(itemName);
        if(itemId === "not found"){ res.status(404).send("not found"); return; }


        let parsedItem = await sorter.itemData(items[itemId]);
        res.status(200).json
        ({
          item: parsedItem
        });

      }
      catch(e){ next(e); }
  },
}
const debug = require("debug")("test:ItemsController");
const fs = require("fs-extra");
const { sorter } = require("../helpers");

module.exports = {
  /**
   * 
   * @param {String} itemName
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
    /**
     * 
     * @param {String} itemName 
     * @returns Full item data
     */
    detailedInfo: async(itemName) => {
      try
      {
        let { data: items} = await fs.readJson(`../datadragon/data/en_US/item.json`);
        
        
        let itemId = await sorter.findItemId(itemName);
        if(itemId === "not found"){ throw {status: 404, message: `Item '${itemName}' not found`} }


        let parsedItem = await sorter.itemData(items[itemId]);

        return( {item: parsedItem} )

      }
      catch(e){ throw e }
  },
}
const debug = require("debug")("test:sorter");
const { outputFile } = require("fs-extra");
const datadragon = require("../datadragon");


const { champion, item:itemJSON, queues } = datadragon;

const { data: champions } = champion;
const { data: items } = itemJSON;


//easy function to capitalize strings
function capitalize(str){
    if(typeof(str) !== "string"){ throw new TypeError("must be a string") }
  
    else
    {
      let a = str.substr(0, 1).toUpperCase();
      let b = str.substr(1);
  
      return a+b;
    }
}

module.exports = {
    championName: async(chid) => 
    {
        if(typeof(chid) !== string){ throw new TypeError("champion id should be a string number"); }

        for (let name in champions) 
        {
            if( champions[name].key === chid ){ return champions[name].name }
        }
    },

    queueName: async(qid) => { return datadragon.queues.filter( (que) => { que.queueId === parseInt(qid) }) },

    findItemId: async(itemName) => 
    {
        for (let key in items)
        {
            if( 
                items[key].name.includes(itemName) || items[key].name.includes(capitalize(itemName)) || items[key].colloq.includes(itemName)
            )
            { return key }
        }
        return "not found";
    },

    itemData: async(key) => 
    {
        debug("itemData key",key);
        let itemFull = items[key];
        let itemDesc = items[key].description;

        //separate stats from description
        let statsList = itemDesc.split("<stats>")[1].split("</stats>")[0].split("<br>");

        //remove any html tags from strings
        statsList.forEach( (item, index, array) => { array[index] = item.replace(/<\/?[^>]+>/g, ""); });

        /*
        * Separate description from stats.
        * Stats end with </stats> so split it away, select the second item
        * then split each passives, actives and rest of descriptions with <br>.
        */
        let descList = itemDesc.split("</stats>")[1].split("<br>");

        let emptyItemIndexes = new Array();
        //clean up the descriptions
        descList.forEach( (item, index, array) => 
        {
          //add indexes of empty items to a list (removing directly here will fuck the index of the array and the loop would miss items)
          if(item.length <= 1){ emptyItemIndexes.push(index); return;}

          //remove any html tags
          array[index] = item.replace(/<\/?[^>]+>/g, "");
        })

        //removes empty strings starting from the back so that the indexes dont get fucked
        while(emptyItemIndexes.length >= 1)
        {
          descList.splice(emptyItemIndexes.pop(), 1);
        }

        let output = {
            name: itemFull.name,
            icon: itemFull.image.full,
            stats: statsList,
            descriptions: descList,
        }

        //check if item builds from another item or builds into another item and provide a list with their name and key
        if(itemFull.from)
        { 
            let buildsFrom = new Array();
            itemFull.from.forEach( item => 
            {
                buildsFrom.push(
                {
                    name: items[item].name,
                    itemKey: item,
                });
            })
            output.buildsFrom = buildsFrom;
        }
        if(itemFull.into)
        {
            let buildsInto = new Array();
            itemFull.into.forEach( item => 
            {
                buildsInto.push(
                {
                    name: items[item].name,
                    itemKey: item,
                });
            })
            output.buildsInto = buildsInto;
        }

        return output;
    }

}
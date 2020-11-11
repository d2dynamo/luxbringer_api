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

/*
*   Keep this for future incase riot decides to fully use the "stats" field. 
*   Stats like Base Mana Regen, Lethality and Magic pen arent displayed in the stats field. 
*   ex: Faerie Charm has Base Mana Regen but its not displayed in the "stats" field.
*/
function statName(statNameFull){
    let statNames = 
    {
        "FlatHPPoolMod":"Health","FlatMPPoolMod":"Mana","PercentHPPoolMod":"Percent Health","PercentMPPoolMod":"Percent Mana",
        "FlatHPRegenMod":"Base Health Regen","PercentHPRegenMod":"percent Health Regen","FlatMPRegenMod":"Base Mana Regen",
        "PercentMPRegenMod":"Percent Mana Regen","FlatArmorMod":"Armor","PercentArmorMod":"Percent Armor","FlatPhysicalDamageMod":"Attack Damage",
        "PercentPhysicalDamageMod":"Percent Attack Damage","FlatMagicDamageMod":"Ability Power","PercentMagicDamageMod":"Percent Ability Power",
        "FlatMovementSpeedMod":"Base Movement Speed","PercentMovementSpeedMod":"Percent Movement Speed","FlatAttackSpeedMod":"Base Attack Speed",
        "PercentAttackSpeedMod":"Percent Attack Speed","PercentDodgeMod":"Percent Dodge Chance","FlatCritChanceMod":"Critical Chance",
        "PercentCritChanceMod":"Percent Critical Chance","FlatCritDamageMod":"Critical Damage","PercentCritDamageMod":"Percent Critical Damage",
        "FlatBlockMod":"Flat Block","PercentBlockMod":"Percent Block","FlatSpellBlockMod":"Flat Spell Block","PercentSpellBlockMod":"Percent Spell Block",
        "FlatEXPBonus":"Base EXP Bonus","PercentEXPBonus":"Percent EXP Bonus","FlatEnergyRegenMod":"Base Energy Regen","FlatEnergyPoolMod":"Base Energy",
        "PercentLifeStealMod":"Percent Lifesteal","PercentSpellVampMod":"Percent Ability Lifesteal"
    }
    return statNames[statNameFull];
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
        for(let key in items)
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
        let passiveIndexes = new Array();
        //clean up the descriptions
        descList.forEach( (item, index, array) => 
        {
          //add indexes of empty items to a list (removing directly here will fuck the index of the array and the loop would miss items)
          if(item.length <= 1){ emptyItemIndexes.push(index); return;}

          //remove any html tags
          if(item.includes("<passive>"))
          array[index] = item.replace(/<\/?[^>]+>/g, "");
        })

        //removes empty strings starting from the back so that the indexes dont get fucked
        while(emptyItemIndexes.length >= 1)
        {
          descList.splice(emptyItemIndexes.pop(), 1);
        }

        return { itemFull }

        // let output = {
        //     name: itemFull.name,
        //     icon: itemFull.image.full,
        //     stats: statsList,
        //     descriptions: descList,
        // }

        // //check if item builds from another item or builds into another item and provide a list with their name and key
        // if(itemFull.from)
        // { 
        //     let buildsFrom = new Array();
        //     itemFull.from.forEach( item => 
        //     {
        //         buildsFrom.push(
        //         {
        //             name: items[item].name,
        //             itemIcon: items[item].image.full,
        //             price: items[item].gold.total
        //         });
        //     })
        //     output.buildsFrom = buildsFrom;
        // }
        // if(itemFull.into)
        // {
        //     let buildsInto = new Array();
        //     itemFull.into.forEach( item => 
        //     {
        //         buildsInto.push(
        //         {
        //             name: items[item].name,
        //             itemIcon: items[item].image.full,
        //             price: items[item].gold.total
        //         });
        //     })
        //     output.buildsInto = buildsInto;
        // }

        // return output;
    }

}
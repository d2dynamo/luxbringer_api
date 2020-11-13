const debug = require("debug")("test:sorter");
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
//Simple sorters to get names/ids by id from ddragon
queueName: async(qid) => { return datadragon.queues.filter( (que) => { que.queueId === parseInt(qid) }) },

championName: async(chid) => 
{
    if(typeof(chid) !== string){ throw new TypeError("champion id should be a string number"); }

    for (let name in champions) 
    {
        if( champions[name].key === chid ){ return champions[name].name }
    }
},

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

//Sort ranked data
rankData: async(data) => 
{
    //filter out solo queue and flex ranked stats
    debug("data", data);

    let filt = data.filter((item) => {
        debug("current item", item.queueType === "RANKED_SOLO_5x5");
        return item.queueType === "RANKED_SOLO_5x5";
    });
    debug("data filtered", filt);

    let xd = new Array()

    let soloQRank = data.filter(item => item.queueType === "RANKED_SOLO_5x5")[0];
    let flexQRank = data.filter(item => item.queueType === "RANKED_FLEX_SR")[0];

    return output =
    {
        soloduo: 
        {
            rank: `${capitalize(soloQRank.tier.toLowerCase())} ${soloQRank.rank}`,
            lp: soloQRank.leaguePoints,
            winRate: `${Math.round(( (soloQRank.wins / (soloQRank.wins + soloQRank.losses)) * 1000 )) / 10}%`
        },
        flex: 
        {
            rank: `${capitalize(flexQRank.tier.toLowerCase())} ${flexQRank.rank}`,
            lp: flexQRank.leaguePoints,
            winRate: `${Math.round(( (flexQRank.wins / (flexQRank.wins + flexQRank.losses)) * 1000 )) / 10}%`
        }
    }
},

/*
* Item sorter. Provide the item id and it will return all the data you could need.
* Will need updating if rito changes how items are described again.
*/
itemData: async(key) => 
{
    let itemFull = items[key];

    //separate stats from description
    let statsList = items[key].description.split("<stats>")[1].split("</stats>")[0].split("<br>");

    //clean up, remove html tags and leading/trailing whitespaces
    statsList.forEach( (item, index, array) => 
    {
        item = item.replace(/<\/?[^>]+>/g, "");
        array[index] = item.trim();
    });

    /*
    * Separate description from stats.
    * Stats end with </stats> so split it away, select the second item and split by <br>.
    * Multiple base passives are separated with <li>, Mythic Passives and other rules come afterwards separated with <br>.
    */
    let descList = items[key].description.split("</stats>")[1].split("<br>");

    let emptyItemIndexes = new Array();
    
    //clean up the descriptions
    descList.forEach( (item, index, array) => 
    {
        //add indexes of empty items to a list (removing directly here will fuck the index of the array and the loop would miss items)
        if(item.length <= 1){ emptyItemIndexes.push(index); return;}

        //remove any html tags
        //If item has passive, replace the tag to mark Passive and then remove html tags 
        item = item.replace("<passive>", "Passive - ");
        item = item.replace(/<\/?[^>]+>/g, "");
        array[index] = item.trim();
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

    //check if item builds from another item or builds into another item and provide a list with their name, price and icon
    //(remove iconName since that is only relevant for the bot?)
    if(itemFull.from)
    { 
        let buildsFrom = new Array();
        itemFull.from.forEach( item => 
        {
            buildsFrom.push(
            {
                name: items[item].name,
                iconName: items[item].image.full,
                price: items[item].gold.total
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
                iconName: items[item].image.full,
                price: items[item].gold.total
            });
        })
        output.buildsInto = buildsInto;
    }

    return output;
}

}
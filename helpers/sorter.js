const debug = require("debug")("test:sorter");
const fs = require("fs-extra");
const legacyItem = require("../legacyDatadragon/legacyItem.json");

const { data: legacyItems } = legacyItem;

// simple function to capitalize strings
function capitalize(str){
    if(typeof(str) !== "string"){ throw new TypeError("must be a string") }
  
    else{ return str.substr(0, 1).toUpperCase() + str.substr(1); }
}


//Champ colloquial object for some common colloquials
const champColloq = [ 
    {full:"MissFortune", colloq:["mf"]}, {full:"MasterYi", colloq:["yi", "yee"]}, {full:"Mordekaiser", colloq:["morde", "hue"]}, 
    {full:"Jhin", colloq:["4", "four", "Khada"]}, {full:"Gangplank", colloq:["gp"]}, {full:"Morgana", colloq:["morg"]},
    {full:"Alistar", colloq:["ali"]}, {full:"DrMundo", colloq:["mundo"]}, {full:"AurelionSol", colloq:["asol", "aurelion"]},
    {full:"Blitzcrank", colloq:["blitz"]}, {full:"Caitlyn", colloq:["cait"]}, {full:"Cassiopeia", colloq:["cass", "cassio"]},
    {full:"Chogath", colloq:["cho", "chonk"]}, {full:"Evelynn", colloq:["eve"]}, {full:"Ezreal", colloq:["ez", "twinkleshit"]},
    {full:"Fiddlesticks", colloq:["fiddle"]}, {full:"Hecarim", colloq:["heca"]}, {full:"Heimerdinger", colloq:["heimer", "donger"]},
    {full:"JarvanIV", colloq:["j4", "jarvan"]}, {full:"Katarina", colloq:["kata"]}, {full:"Khazix", colloq:["kha", "bug"]},
    {full:"Kogmaw", colloq:["kog"]}, {full:"Leblanc", colloq:["lb"]}, {full:"LeeSin", colloq:["lee"]},
    {full:"Malphite", colloq:["malph", "rock"]}, {full:"Nautilus", colloq:["naut", "nauti"]}, {full:"Nidalee", colloq:["nida"]},
    {full:"Orianna", colloq:["ori"]}, {full:"Pantheon", colloq:["panth"]}, {full:"Seraphine", colloq:["sera"]},
    {full:"TahmKench", colloq:["tahm", "kench"]}, {full:"Teemo", colloq:["rodent"]}, {full:"TwistedFate", colloq:["tf"]},
    {full:"Twitch", colloq:["rat"]}, {full:"Warwick", colloq:["ww"]}, {full:"Wukong", colloq:["monke", "monkey"]},
    {full:"Yuumi", colloq:["the cat", "cat"]}, {full:"Zed", colloq:["what was that"]}
]



/*
*   Keep this for future incase riot decides use the "stats" field on items. 
*   Stats like Base Mana Regen, Lethality and Magic pen arent displayed in the stats field. 
*   ex: Faerie Charm has Base Mana Regen but its not displayed in the "stats" field.
*/
function statName(statNameFull){
    let statNames = 
    {
        "FlatHPPoolMod":"Health","FlatMPPoolMod":"Mana","PercentHPPoolMod":"Percent Health","PercentMPPoolMod":"Percent Mana",
        "FlatHPRegenMod":"Base Health Regen","PercentHPRegenMod":"Percent Health Regen","FlatMPRegenMod":"Base Mana Regen",
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
//--------------Simple sorters to get names/ids from datadragon--------------\\


/**
 * 
 * @param {number} qid - Queue id 
 * @returns queue name
 */
findQueueName: async(qid) => 
{
    let queues = await fs.readJson(`./datadragon/queues.json`);

    return queues.filter
    ( 
        (que) => { return que.queueId === parseInt(qid) } 
    )[0].description;
},

/**
 * 
 * @param {string} qname - queue name
 * @returns an array of queue id's that matched
 */
findQueueIds: async(qname) => 
{ 
    let queues = await fs.readJson(`./datadragon/queues.json`);


    let output = new Array();

    //filter through queues and skip deprecated queues.
    queues.filter
    (
        (que) => { if( !que.notes || !que.notes.includes("Deprecated") ){ return que.description.toLowerCase().includes(qname) } } 
    )
    .forEach( item => { output.push(item.queueId) } )

    return output;
},

/**
 * 
 * @param {object} match 
 * @returns role name
 */
findRoleName: async(match) =>
{
    if( match.role === "DUO_SUPPORT" ){ return "support" }
    else{
        switch(match.lane)
        {
            case "BOTTOM": return "adc";
            default: return match.lane.toLowerCase();
        }
    }
},


/** Find champion name by chmapion id */
findChampionName: async(chid) => 
{
    let { data:champions } = await fs.readJson("./datadragon/data/en_US/champion.json");

    for (let name in champions) 
    {
        if( 
            champions[name].key === chid.toString() 
        )
        { return champions[name].name }
    }
    return "champion not found";
},


/** Find item id by item name */
findItemId: async(itemName) => 
{
    let { data: items} = await fs.readJson(`./datadragon/data/en_US/item.json`);

    for(let key in items)
    {
        if( 
            items[key].name.toLowerCase().includes(itemName.toLowerCase()) || items[key].colloq.includes(itemName.toLowerCase())
        )
        { return key }
    }

    return "not found";
},


//--------------More complex sorters for bigger data--------------\\
//NOTE: Data sorters should take the actual data objects that will be sorted from, not just name or id.
//This is for the simplicity of writing these sorters


/** Sort ranked data, takes the response body from /league/v4/entries/by-summoner */
rankData: async(data) => 
{
    //find and assign solo and flex rank object
    let soloQRank = data.filter(item => item.queueType === "RANKED_SOLO_5x5")[0];
    let flexQRank = data.filter(item => item.queueType === "RANKED_FLEX_SR")[0];

    //define unranked output if no soloq or flex rank found
    let output = {
        soloduo:
        {
            rank: `unranked`,
            lp: 0,
            winRate: `0`
        },
        flex:
        {
            rank: `unranked`,
            lp: 0,
            winRate: `0`
        }
    }

    //if soloq or flex rank found, add it to output
    if(soloQRank){
        output.soloduo =
        {
            rank: `${capitalize(soloQRank.tier.toLowerCase())} ${soloQRank.rank}`,
            lp: soloQRank.leaguePoints,
            winRate: `${Math.round(( (soloQRank.wins / (soloQRank.wins + soloQRank.losses)) * 1000 )) / 10}%`
        }
    }

    if(flexQRank){
        output.flex =
        {
            rank: `${capitalize(flexQRank.tier.toLowerCase())} ${flexQRank.rank}`,
            lp: flexQRank.leaguePoints,
            winRate: `${Math.round(( (flexQRank.wins / (flexQRank.wins + flexQRank.losses)) * 1000 )) / 10}%`
        }
    }
    return output;
},


/** Simple item data without description and stats, meant mainly for match info */
itemDataSimple: async(data) => 
{
    return {
        name: data.name,
        price: data.gold.total,
        icon: data.image.full,
    }
},


/**
 * 
 * @param {object} data 
 * @param {boolean} legacy 
 * @returns Full item data
 * 
 * Takes an item object from the items.json.
 */
itemData: async(data, legacy) => 
{
    let { data: items} = await fs.readJson(`./datadragon/data/en_US/item.json`);

    let statsList = null;
    //separate stats from description if <stats> tag exists
    if(data.description.includes("<stats>")) 
    {
        statsList = data.description.split("<stats>")[1].split("</stats>")[0].split("<br>");

        //clean up, remove html tags and leading/trailing whitespaces
        statsList.forEach( (item, index, array) => 
        {
            item = item.replace(/<\/?[^>]+>/g, "");
            array[index] = item.trim();
        });
    }


    /*
    * Separate description from stats.
    * If there are any <stats> fields, stats end with </stats> so split it away, then select the second item and split by <br>.
    * Else just split with <br>
    */
    let descList = new Array();
    if(statsList !== null){ descList = data.description.split("</stats>")[1].split("<br>"); }
    else{ descList = data.description.split("<br>"); }
    

    //clean up the descriptions
    let emptyItemIndexes = new Array();
    descList.forEach( (item, index, array) => 
    {
        //add indexes of empty items to a list (removing directly here will fuck the index of the array and the loop would miss items)
        if(item.length <= 1){ emptyItemIndexes.push(index); return;}

        //replace any <passive> tags
        item = item.replace(/<passive>/g, "Passive - ");
        //remove all other html tags
        item = item.replace(/<\/?[^>]+>/g, "");
        array[index] = item.trim();
    })
    //removes empty strings starting from the back so that the indexes dont get fucked
    while(emptyItemIndexes.length >= 1)
    {
        descList.splice(emptyItemIndexes.pop(), 1);
    }


    //Define output\\
    let output = {
        name: data.name,
        price: data.gold.total,
        icon: data.image.full,
        descriptions: descList
    }


    //If there is a statslist, add it
    if(statsList){ output.stats = statsList } 


    //check if item builds from another item or builds into another item and provide a list with their name, price and icon
    //(remove iconName since that is only relevant for the bot?)
    if(data.from)
    { 
        let buildsFrom = new Array();
        data.from.forEach( item => 
        {
            if(legacy)
            {
                buildsFrom.push(
                {
                    name: legacyItems[item].name,
                    iconName: legacyItems[item].image.full,
                    price: legacyItems[item].gold.total
                });
            }
            else
            {
                buildsFrom.push(
                {
                    name: items[item].name,
                    iconName: items[item].image.full,
                    price: items[item].gold.total
                });
            }
        })
        //add to output
        output.buildsFrom = buildsFrom;
    }

    //if item builds into another item
    if(data.into)
    {
        let buildsInto = new Array();
        data.into.forEach( item => 
        {
            if(legacy)
            {
                buildsInto.push(
                {
                    name: legacyItems[item].name,
                    iconName: legacyItems[item].image.full,
                    price: legacyItems[item].gold.total
                });
            }
            else
            {
                buildsInto.push(
                {
                    name: items[item].name,
                    iconName: items[item].image.full,
                    price: items[item].gold.total
                });
            }
        })
        //add builds from/into to output
        output.buildsInto = buildsInto;
    }

    return output;
//END OF itemData()
},


/**
 * @param {object} data - Match stats object (not response body but response.body.stats)
 * @param {string} summonerName - The requested summoner's name so that the specified summoner's stats can be sorted out of the rest
*/
matchData: async(data, summonerName) => 
{   
/*
* Current return data format is:
*
* game duration;
* teamBlue & teamRed: win bool; towers taken; kills;
* 
* Requested summoner: 
*   team; champion name; K/D/A; cs/min; total gold; vision score; wards placed; 
*   summspells; items; runes[]; totalDamageDealt; totalDamageTaken;
* 
* Every summoner: 
*   summoner name; iconId; team; champion name; K/D/A; cs/min; summspells; items[]; rune styles primary/second;
*/

let { data: summonerSpells } = await fs.readJson(`./datadragon/data/en_US/summoner.json`);
let { data: items} = await fs.readJson(`./datadragon/data/en_US/item.json`);
let { data: runes} = await fs.readJson(`./datadragon/data/en_US/runesReforged.json`);

//Get summoner's participant id
let sPID = data.participantIdentities.filter( item => item.player.summonerName === summonerName )[0].participantId;
//get summoner match stats
let summonerData = data.participants.filter ( item => item.participantId === sPID)[0];

let output = 
{
    gameVerison: data.gameVersion,
    gameDuration: data.gameDuration,
    teamBlue: 
    { 
        win: data.teams.filter( item => item.teamId === 100)[0].win === "Win",
        towersTaken: data.teams.filter( item => item.teamId === 100)[0].towerKills, 
        totalKills: (()=>
        {
            let count = 0;
            for (const participant of data.participants){ 
                if(participant.teamId === 100){count += participant.stats.kills} 
            }
            return count;
        })() 
    }, 

    teamRed: 
    { 
        win: data.teams.filter( item => item.teamId === 200)[0].win === "Win",
        towersTaken: data.teams.filter( item => item.teamId === 200)[0].towerKills, 
        totalKills: (()=>
        {
            let count = 0;
            for (const participant of data.participants){ 
                if(participant.teamId === 200){count += participant.stats.kills} 
            }
            return count;
        })() 
    }, 

    summoner: 
    {   
        //Parse team name (will probably be broken on any new game modes with more than two teams.)
        team: ((x) => 
        { 
            switch(x)
            { 
                case 100: return "Blue";
                case 200: return "Red";
                default: return "unknown team";
            } 
        })(summonerData.teamId),


        //Parse champion name with local exported function
        champion: await module.exports.findChampionName(summonerData.championId),
        

        //Parse kills/deaths/assists
        kda: ((x) => 
        {
            return `${x.kills}/${x.deaths}/${x.assists}`
        })(summonerData.stats),
        

        //Parse creep slaying per minute
        csPerMin: ((x, y) => 
        {
            return +(Math.round(x / (y/60) + "e+2") + "e-2");
        })(summonerData.stats.totalMinionsKilled, data.gameDuration),


        //Total gold earned
        gold: summonerData.stats.goldEarned,


        //Vision score
        visionScore: summonerData.stats.visionScore,


        //Total amount wards placed
        wardsPlaced: summonerData.stats.wardsPlaced,


        //Damage dealt/taken
        totalDamageDealt: summonerData.stats.totalDamageDealt,
        totalDamageTaken: summonerData.stats.totalDamageTaken,


        //Parse summoner spell names
        summonerSpell1: ((_summonerSpells, _spell1Id) =>
        {
            for (const item of Object.keys(_summonerSpells)) {
                if(_summonerSpells[item].key === _spell1Id.toString()){ return _summonerSpells[item].name }
            }
        })(summonerSpells, summonerData.spell1Id),
        
        summonerSpell2: ((_summonerSpells, _spell2Id) =>
        {
            for (const item of Object.keys(_summonerSpells)) {
                if(_summonerSpells[item].key === _spell2Id.toString()){ return _summonerSpells[item].name }
            }
        })(summonerSpells, summonerData.spell2Id),


        //Parse items
        items: await (async(_participantStats) =>
        {
            //parse game version
            let gameVer = data.gameVersion.split(".");
    
            /*
            * if match version is older than version starting preseason 13 (mythic item update), 
            * attempt to use legacy items from version 9.24.1
            * This is unreliable and luxbringer is not meant to delve into legacy history
            * API and discordbot documentation and user introduction should mention that luxbringer is not meant to provide legacy data
            */
            let legacy = false;
            if( 
                ( parseInt(gameVer[0]) === 10 && parseInt(gameVer[1]) >= 23 ) 
                || (parseInt(gameVer[0]) > 10) 
                //select current items json, else legacy items json
            ) { _items = items; }
            else { _items = legacyItems; legacy = true; }
    
            //there are 7 items starting with "item0", parse each one ("item6" is trinket)
            let out = new Array();
            for(i = 0; i <= 6; i++)
            {
                if(_participantStats[`item${i}`] !== 0) 
                {
                    //simple data sorter still takes the item object to keep uniform so select it from the json
                    let parsedItem = await module.exports.itemDataSimple( _items[ _participantStats[`item${i}`] ] );
                    out.push(parsedItem); 
                }
            }
    
            return out;
        })(summonerData.stats),


        //Parse runes
        runes: ((x) =>
        {
            let out = new Object();
            out.primary = new Array();
            out.secondary = new Array();
            //currently dont have a reliable way of getting stat mods (the ones below the secondary rune page. 10% attack speed, 9 adaptive force etc.)
            //out.stats = new Array();
    
            for(i = 0; i <= 3; i++)
            {
                //foreach element in the root array
                runes.forEach( element => 
                {
                    //match rune style (Domination, Resolve etc.)
                    if(element.id === x.perkPrimaryStyle)
                    {
                        /*
                        * Each slots array is a rune row in the game. Ex: the first "slots" array contains objects of keystones such as Electrocute or Aftershock.
                        * and the rest of the "slots" arrays contain each rune styles' runes such as Sudden Impact or Font of Life
                        */
                        element.slots.forEach( slot => 
                        {
                            //foreach rune (Sudden Impact, Font of Life etc.) in the "slots" array 
                            slot.runes.forEach( item => 
                            {
                                if(item.id === x[`perk${i}`]){ out.primary.push({ name:item.name, icon:item.icon }) }
                            })
                        })
                    }
                })
            }
    
            for(i = 4; i <= 5; i++)
            {   
                //Find secondary rune style
                runes.forEach( element => 
                    {
                        if(element.id === x.perkSubStyle)
                        {
                            element.slots.forEach( slot => 
                            {
                                slot.runes.forEach( item => 
                                {
                                    if(item.id === x[`perk${i}`]){ out.secondary.push({ name:item.name, icon:item.icon })}
                                })
                            })
                        }
                    })
            }
    
            return out;
        })(summonerData.stats)
    },



    //Parse other summoner's data
    players: await(async() =>
    {

        let playersOut = new Array();

        for (const participant of data.participants) {
            //the player object to be pushed into the 'playersOut' array
            let player = new Object();


            player.name = data.participantIdentities.filter( item => item.participantId == participant.participantId)[0].player.summonerName;
            
            player.iconId = data.participantIdentities.filter( item => item.participantId == participant.participantId)[0].player.profileIcon;


            player.team = (() => 
            { 
                switch(participant.teamId)
                { 
                    case 100: return "Blue";
                    case 200: return "Red";
                    default: return "unknown team";
                } 
            })();


            player.champion = await module.exports.findChampionName(participant.championId);


            player.kda = ((x) =>{ return `${x.kills}/${x.deaths}/${x.assists}` })(participant.stats);


            player.csPerMin = ((x, y) => { return x / (y/60); })(participant.stats.totalMinionsKilled, data.gameDuration);


            player.gold = participant.stats.goldEarned,


            player.summonerSpell1 = ((_summonerSpells, _spell1Id) =>
            {
                for (const item of Object.keys(_summonerSpells)) {
                    if(_summonerSpells[item].key === _spell1Id.toString()){ return _summonerSpells[item].name }
                }
            })(summonerSpells, participant.spell1Id);

            player.summonerSpell2 = ((_summonerSpells, _spell2Id) =>
            {
                for (const item of Object.keys(_summonerSpells)) {
                    if(_summonerSpells[item].key === _spell2Id.toString()){ return _summonerSpells[item].name }
                }
            })(summonerSpells, participant.spell2Id);


            player.items = await (async(_participantStats) =>
            {   
                let gameVer = data.gameVersion.split(".");


                let _items;
                let legacy = false;
                if( 
                    ( parseInt(gameVer[0]) === 10 && parseInt(gameVer[1]) >= 23 ) 
                    || (parseInt(gameVer[0]) > 10) 
                ) { _items = items; }
                else { _items = legacyItems; legacy = true; }
                    

                let out = new Array();
                
                for(i = 0; i <= 6; i++){
                    if(_participantStats[`item${i}`] !== 0) 
                    {
                        let parsedItem = new Object();
                        if(_items[ _participantStats[`item${i}`]] === undefined){ parsedItem = { name: "Unknown Legacy Item" } }
                        else{ parsedItem = await module.exports.itemDataSimple( _items[ _participantStats[`item${i}`] ] ); }
                        out.push(parsedItem);
                    }
                    if(i === 6){ return out }
                }
            })(participant.stats);

            //Only need to get the keystone (Electrocute, Aftershock etc) and the secondary rune style (Domination, Resolve etc.)
            player.runes = (() =>
            {
                let out = new Array();

                out.push(
                    //get keystone name
                    runes.filter( element => element.id === participant.stats.perkPrimaryStyle )[0].slots[0].runes.filter(rune => rune.id === participant.stats.perk0)[0].name 
                )

                out.push(
                    //get secondary runepage style name
                    runes.filter( element => element.id === participant.stats.perkSubStyle )[0].name
                )

        
                return out;
            })()

            //push player to players array
            playersOut.push(player);
        }

        //asigns to output.players
        return playersOut;
    })()
//END OF let = output
}

return output;
//END OF matchData()
},


/** 
 * Get simple champion info. Takes a champion name 
 * @param {String} champName champion name
 * @returns simple champion data Object
 */
championDataSimple: async(champName) => 
{   
    const { data } = await fs.readJson("./datadragon/data/en_US/champion.json");

    //check if champName is a colloquial and replace it with full name
    for(let item of champColloq){
       if(item.colloq.includes(champName)){ champName = item.full; break;}
    }
    //check if champName is just part of the full name and replace it with full name
    for(let item in data){
        if(item.substr(0, champName.length).includes(capitalize(champName))){ champName = item; break;}
    }
    //if champName contains a space, capitalize both words and remove the spacebar (champ names such as Miss Fortune are assigned as MissFortune)
    if(champName.includes(" ")){
        champName = capitalize(champName.substr(0, champName.indexOf(" "))) + capitalize(champName.substr(champName.indexOf(" ") +1))
    }
    
    if( !data[capitalize(champName)] ){ throw {status: 404, message: `Champion '${champName}' does not exist`} }

    let champion = data[capitalize(champName)]

    let output = 
    {
        name: champion.name,

        hp: champion.stats["hp"],
        hpPerLevel: champion.stats["hpperlevel"],

        hpRegen: champion.stats["hpregenperlevel"],
        hpRegenPerLevel: champion.stats["hpregenperlevel"],

        resourceType: champion.partype,
        mp: champion.stats["mp"],
        mpPerLevel: champion.stats["mpperlevel"],

        mpRegen: champion.stats["mpregen"],
        mpRegenPerLevel: champion.stats["mpregenperlevel"],

        armor: champion.stats["armor"],
        armorPerLevel: champion.stats["armorperlevel"],

        mr: champion.stats["spellblock"],
        mrPerLevel: champion.stats["spellblockperlevel"],

        ad: champion.stats["attackdamage"],
        adPerLevel: champion.stats["attackdamageperlevel"],

        as: champion.stats["attackspeed"],
        asPerLevel: champion.stats["attackspeedperlevel"],

        range: champion.stats["attackrange"],

        ms: champion.stats["movespeed"],

    }

    return output;
},

/** Get detailed champion info */
// ex: the base damage of aatrox Q increase per level
// championData: async(champName) => 
// {
//     fs.readJson(`./datadragon/data/en_US/champion/${champName}.json`)
//     .then(json => {
//         data = json.data.Aatrox;
//     })
//     .catch(e => { throw e })
// }

}
# LUXBRINGER API

# API for getting data from League of Legends API and datadragon stuff.

## Must download and extract datadragon files for the server to use before first run (https://developer.riotgames.com/docs/lol).
### Extract the following directories into ./datadragon: (note that most of these are in a directory with version as name ex: "./10.21.1/manifest.json")
"/manifest.json", "/data/en_US", "/img/champion", "/img/item", "/img/passive",
"/img/profileicon", "/img/spell", "img/champion/tiles", "img/perk-images"

If the manifest.json is missing then app.js will crash and if other files are missing then /lux endpoints will respond with error
Keep legacy items from s9 for now.

## Current features:
Retrieve summoner info

Retrieve summoner match data (up to 5 latest matches)

Retrieve basic or detailed item data

Retrieve basic champion stats

## TODO:
Retrieve detailed champion info which includes base stats and ability stats (Ability data is included in each champion's json in /data/en_US/champion/${CHAMPION_NAME}.json).

Separate all sorter functions into separate files? sorter.js is already at 700 lines with a plethora of separate sorter functions.

Rewrite controllers to use fs-extra.readJson to read datadragon data files and validate datadragon files with fs-extra.pathExists before serving from datadragon dependant endpoints.
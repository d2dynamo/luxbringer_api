# LUXBRINGER API
API for getting data from League of Legends API and other League of Legends data.

Can read PORT env variable. Defaults to 3000.

### Datadragon files can be left for the api to automatically download. So no initial setup is required.
You should still make sure that the datadragon updater does finnish the update (it can take a while since datadragon is close to 1gb in size)
Updater sends logs to console at various points of the update process.

dd files can be manually downloaded from (https://developer.riotgames.com/docs/lol).

Extract the following directories into ./datadragon: (note that most of these are in a directory with version as name ex: "./10.21.1/manifest.json"):
"/manifest.json", "/data/en_US", "/img/champion", "/img/item", "/img/passive",
"/img/profileicon", "/img/spell", "img/champion/tiles", "img/perk-images"

Legacy items from s9 are kept for now.

## Current features:
Retrieve summoner info

Retrieve summoner match data (up to 5 latest matches)

Retrieve basic or detailed item data

Retrieve basic champion stats

## TODO:
Retrieve detailed champion info which includes base stats and ability stats (Ability data is included in each champion's json in /data/en_US/champion/${CHAMPION_NAME}.json).

Rewrite DatadragonUpdater to download files separately instead of the full datadragon zip.
Alot of the files in the complete zip are just translated files.

Separate all sorter functions into separate files? 
sorter.js is already at 700 lines with a plethora of separate sorter functions.

Make sure datadragon files exist before serving from datadragon dependant endpoints? 
That shouldnt be necesary since /lux end points are unreachable while dd files being updated.

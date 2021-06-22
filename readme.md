# LUXBRINGER API
API for getting data from League of Legends API and other League of Legends data.

Can read 'PORT' env variable. Defaults to 3000.

## Setup
Create ./config/index.js and export your riot api key from there

Datadragon files can be left for the api to automatically download.

You should still make sure that the datadragon updater does finnish the update (it can take a while since datadragon zip is close to 1gb in size)
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
Separate all sorter functions into separate files in a 'sorters' dir (also put champ colloquials object into a json in sorters dir).

Retrieve detailed champion info which includes base stats and ability stats.
(Should it include descriptions? The 'champion' commands are meant for easy checking and comparing of the ever changing champion stats, not learning what exactly the champion does.)

Write a summoner stat parser which includes summoner's average performance in past 50 blind/draft/soloq games. (name as 'detailed summoner info').
(Make sure support and jungler game stats get calculated separately from laners?)

Rewrite DatadragonUpdater to download files separately instead of the full datadragon zip.
Alot of the files in the complete zip are just translated files and i should probably skip the image files too cause they seem pointless here.


Consider writing summoner stats sorter as a microservice? 
The summoner stats sorter will proccess up to 300 games which means it can very quickly become a bottleneck if and when more people start using luxbringer.
This would also allow using a language better suited for big data processing like python.



Make sure datadragon files exist before serving from datadragon dependant endpoints? 
That shouldnt be necesary since /lux end points are unreachable while dd files being updated.

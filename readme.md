LUXBRINGER API

API for getting some data from League of Legends api and datadragon stuff.

Datadragon updater written quickly with a stupid fs chain which breaks upon missing directory, 
initial setup will require to have the following directories created in project root directory:
"./datadragon"
"./temp/datadragon"
Gonna make it all automatic eventually...

Keep legacy items from s9 for now.

Current features:
Retrieve summoner info

Retrieve basic or detailed item data

Retrieve basic champion stats

TODO:
Retrieve detailed champion info which includes base stats and ability stats (Ability data is not included in the champion.json. Ability data is included in each champion's json in data/en_US/champion/[CHAMPION_NAME].json).

Fix the damn datadragon updater so it doesnt need you to create two directories before it updates once.
Also, datadragon file importers have ddragon version hardcoded, store ddragon version as env variable? actually should just probably do 'global.' on this one.

Separate all sorter functions into separate files? sorter.js will have over 700 lines and 12 exported functions once detailed champion sorter is added.
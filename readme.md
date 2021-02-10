LUXBRINGER API

API for getting some data from League of Legends api and datadragon stuff.

Datadragon updater written quickly with a stupid fs chain which breaks upon missing directory, 
initial setup will require to have the following directories created in project root directory:
"./datadragon"
"./temp/datadragon"
Gonna make it all automatic eventually...


Current features:
Retrieve summoner info

Retrieve basic or detailed item data

Retrieve basic champion stats

TODO:
Retrieve detailed champion info which includes base stats and ability stats

Fix the damn datadragon updater so it doesnt need you to create two directories before it updates once
Also,ddragon file importers have ddragon version hardcoded, store ddragon version as env variable? actually should just probably do 'global.' on this one
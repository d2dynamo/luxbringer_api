module.exports = {
    urlGet: (type, region) => {
        let url = "";
        switch (region) {
            case "euw":
                url = "https://euw1.api.riotgames.com/lol";
                break;
            case "eune":
                url = "https://eun1.api.riotgames.com/lol";
                break;
            case "br":
                url = "https://br1.api.riotgames.com/lol";
                break;
            case "jp":
                url = "https://jp1.api.riotgames.com/lol";
                break;
            case "kr":
                url = "https://kr.api.riotgames.com/lol";
                break;
            case "lan":
                url = "https://la1.api.riotgames.com/lol";
                break;
            case "las":
                url = "https://la2.api.riotgames.com/lol";
                break;
            case "na":
                url = "https://na1.api.riotgames.com/lol";
                break;
            case "oce":
                url = "https://oce1.api.riotgames.com/lol";
                break;
            case "tr":
                url = "https://tr1.api.riotgames.com/lol";
                break;
            case "ru":
                url = "https://ru.api.riotgames.com/lol";
                break;
        }
        switch (type) {
            case "summoner":
                url += "/summoner/v4/summoners/by-name/";
            break;
            case "summoner_masteries":
                url += "/champion-mastery/v4/champion-masteries/by-summoner/";
            break;
            case "summoner_match_list":
                url += "/match/v4/matchlists/by-account/";
            break;
            case "current_game":
                url += "/spectator/v4/active-games/by-summoner/";
            break;
            case "summoner_rank":
                url += "/league/v4/entries/by-summoner/"
            break;
            case "match_stats":
                url += "/match/v4/matches/"
            break;
        }
        return url;
    }
};
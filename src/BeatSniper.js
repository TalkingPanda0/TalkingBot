async function getPlayerData(playerName) {
    return JSON.parse(await(await fetch(`https://api.beatleader.xyz/players?search=${playerName}`)).text());
}

async function getSongs(playerId) {
    return JSON.parse(await(await fetch(`https://api.beatleader.xyz/player/${playerId}/scores?sortBy=date&order=desc`)).text());
}

async function getSongLeaderboardPosition(playerId, songId, diff, mode) {
    return JSON.parse(await(await fetch(`https://api.beatleader.xyz/player/${playerId}/scorevalue/${songId}/${diff}/${mode}`)).text());
}

async function getSongsByPlayerName(playerName) {
    const playerData = (await getPlayerData(playerName)).data[0];
    const playerId = playerData['id'];
    const songs = await getSongs(playerId);

    return songs;
}

export async function kill(playerName) {
    let songsToRequest = [];
    let enemySongs = (await getSongsByPlayerName(playerName)).data;

    while (songsToRequest.length < 3 && enemySongs.length != 0) {
        let song = enemySongs[0]['leaderboard'];

        let playerId = (await getPlayerData("SweetbabooO_o")).data[0]['id'];
        let songId = song['song']['hash'];
        let songDiff = song['difficulty']['difficultyName'];
        let songMode = song['difficulty']['modeName'];

        let myScore = await getSongLeaderboardPosition(playerId, songId, songDiff, songMode)
            if (enemySongs[0]['baseScore'] > myScore) {
                songId = song['song']['id'];
                songsToRequest.push(songId);
            }

        enemySongs.splice(0, 1);
    }

    return songsToRequest;
}

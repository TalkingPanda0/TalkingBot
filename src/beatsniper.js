async function getPlayerData(playerName) {
    return await(await fetch(`https://api.beatleader.xyz/players?search=${playerName}`)).json();
}

async function getSongs(playerId) {
    return await(await fetch(`https://api.beatleader.xyz/player/${playerId}/scores?sortBy=date&order=desc`)).json();
}

async function getSongLeaderboardPosition(playerId, songId, diff, mode) {
    return await(await fetch(`https://api.beatleader.xyz/player/${playerId}/scorevalue/${songId}/${diff}/${mode}`)).json();
}

async function getSongsByPlayerName(playerName) {
    const playerData = (await getPlayerData(playerName)).data[0];
		if(playerData === undefined) return null;
    const playerId = playerData['id'];
    const songs = await getSongs(playerId);

    return songs;
}

export async function kill(playerName) {
	try {
    const songsToRequest = [];
    const enemySongs = (await getSongsByPlayerName(playerName)).data;
		if(enemySongs === null) return [];
    while (songsToRequest.length < 3 && enemySongs.length != 0) {
        const song = enemySongs.shift()['leaderboard'];

        const playerId = (await getPlayerData("SweetbabooO_o")).data[0]['id'];
        let songId = song['song']['hash'];
        const songDiff = song['difficulty']['difficultyName'];
        const songMode = song['difficulty']['modeName'];

        const myScore = await getSongLeaderboardPosition(playerId, songId, songDiff, songMode)
            if (enemySongs[0]['baseScore'] > myScore) {
                songId = song['song']['id'];
                songsToRequest.push(songId);
            }
    }

    return songsToRequest;
	} catch(e){
		console.error(e);
		return [];
	}

}

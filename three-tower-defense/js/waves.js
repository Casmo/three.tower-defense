function spawnWave() {
	waveTimer = (new Date().getTime() / 1000);
	currentWave++;
	if (currentWave > 2) {
		//currentWave = 1;
		//addExtraHP *= 1.6;
	}
	x = 0;
	maxY = boardSize.z / tileSize
	timeOut = 0;
	maxMonsters = currentWave * 5;
	if (maxMonster > 100) {
		maxMonsters = 100;
	}
	timePerMonsterInSeconds = (waveSeconds / maxMonsters) / 3;
	for (i = 0; i < maxMonsters; i++) {
		timeOut = timeOut + (timePerMonsterInSeconds * 1000);
		setTimeout(function() { spawnMonster(tilesSizes[0][Math.floor(Math.random() * maxY)]) }, timeOut);
	}
}
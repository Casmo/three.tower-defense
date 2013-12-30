function spawnWave() {
	waveTimer = (new Date().getTime() / 1000);
	currentWave++;
	if (currentWave > 2) {
		//currentWave = 1;
		//addExtraHP *= 1.6;
	}
	x = 0;
	maxY = Math.floor(boardSize.z / tileSize) - 1;
	timeOut = 0;
	maxMonsters = currentWave * 5;
	if (maxMonsters > 50) {
		maxMonsters = 50;
	}
	someStats = new Object();
	someStats.hp = Math.round((currentWave+1) * 4.8);
	if (someStats.hp > 400) {
		someStats.hp = 400;
	}
	someStats.speed = 1;
	if (someStats.speed > 10) {
		someStats.speed = 10;
	}
	someStats.currency = Math.ceil(currentWave * 0.4);
	if (someStats.currency > 8) {
		someStats.currency = 8;
	}
	timePerMonsterInSeconds = (waveSeconds / maxMonsters) / 3;
	for (i = 0; i < maxMonsters; i++) {
		timeOut = timeOut + (timePerMonsterInSeconds * 1000);
		setTimeout(function() { spawnMonster(tilesSizes[0][Math.floor(Math.random() * maxY)], someStats) }, timeOut);
	}
}
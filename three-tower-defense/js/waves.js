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
	if (maxMonsters > 70) {
		maxMonsters = 70;
	}
	someStats = new Object();
	someStats.hp = Math.round((currentWave+1) * 5.1);
	if (someStats.hp > 800) {
		someStats.hp = 800;
	}
	someStats.speed = 1;
	if (someStats.speed > 10) {
		someStats.speed = 10;
	}
	someStats.currency = Math.ceil(currentWave * 0.3);
	if (someStats.currency > 2) {
		someStats.currency = 2;
	}
	timePerMonsterInSeconds = (waveSeconds / maxMonsters) / 3;
	for (i = 0; i < maxMonsters; i++) {
		timeOut = timeOut + (timePerMonsterInSeconds * 1000);
		setTimeout(function() { spawnMonster(tilesSizes[0][Math.floor(Math.random() * maxY)], someStats) }, timeOut);
	}
}
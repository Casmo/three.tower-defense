function spawnWave() {
	waveTimer = (new Date().getTime() / 1000);
	currentWave++;
	if (currentWave > maxWaves) {
		if (score.lives > 0) {
			document.getElementById('spawn-timer').innerHTML = 'You survived!';
		}
		else {
			document.getElementById('spawn-timer').innerHTML = 'You did not survive. Try again!';
		}
		return true;
	}
	x = 0;
	maxY = Math.floor(boardSize.z / tileSize) - 1;
	timeOut = 0;
	maxMonsters = Math.round(currentWave * 1.2);
	if (maxMonsters > Math.round(maxWaves * 1.2)) {
		maxMonsters = Math.round(maxWaves * 1.2);
	}
	someStats = new Object();
	someStats.hp = Math.round((currentWave+1) * 24);
	if (someStats.hp > Math.round(maxWaves * 24)) {
		someStats.hp = Math.round(maxWaves * 24);
	}
	someStats.hp_100 = someStats.hp;
	someStats.speed = 0.125;
	if (someStats.speed > 10) {
		someStats.speed = 10;
	}
	someStats.currency = 1;
	timePerMonsterInSeconds = (waveSeconds / maxMonsters) / 3;
	for (i = 0; i < maxMonsters; i++) {
		timeOut = timeOut + (timePerMonsterInSeconds * 1000);
		setTimeout(function() { spawnMonster(tilesSizes[0][Math.floor(Math.random() * maxY)], someStats) }, timeOut);
	}
}
function spawnWave() {
	waveTimer = (new Date().getTime() / 1000);
	currentWave++;
	if (currentWave > 25) {
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
	maxMonsters = Math.round(currentWave * 3.2);
	if (maxMonsters > 80) {
		maxMonsters = 80;
	}
	someStats = new Object();
	someStats.hp = Math.round((currentWave+1) * 12);
	if (someStats.hp > 300) {
		someStats.hp = 300;
	}
	someStats.speed = 1;
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
function spawnWave() {
	currentWave++;
	document.getElementById('spawn-timer').innerHTML = currentWave;
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
	countMonsters = Math.round(currentWave * 1.5);
	currentMonsters = countMonsters;
	
	someStats = new Object();
	someStats.hp = Math.round((currentWave+1) * 22);
	someStats.hp_100 = someStats.hp;
	
	someStats.speed = 0.125;
	if (currentWave > 6) {
		someStats.speed = 0.250;
	}
	if (currentWave > 12) {
		someStats.speed = 0.5;
	}
	if (someStats.speed > 10) {
		someStats.speed = 10;
	}
	someStats.currency = 1;
	timePerMonsterInMs = 650;
	timeOut = 0;
	for (i = 0; i < currentMonsters; i++) {
		timeOut = timeOut + timePerMonsterInMs;
		setTimeout(function() { spawnMonster(tilesSizes[0][Math.floor(Math.random() * maxY)], someStats) }, timeOut);
	}
}
function spawnWave() {
	if (gameStarted == false) {
		return true;
	}
	currentWave++;
	document.getElementById('spawn_waves').innerHTML = currentWave +'/' + maxWaves;
	percent = 100 / maxWaves * currentWave;
	document.getElementById('spawn_percent').style.width = percent +'%';
	if (currentWave > maxWaves || score.lives <= 0) {
		if (score.lives > 0) {
			document.getElementById('spawn_waves').innerHTML = 'Survived!';
		}
		else {
			document.getElementById('spawn_waves').innerHTML = 'Failed!';
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
		interval = setTimeout(function() { spawnMonster(tilesSizes[0][Math.floor(Math.random() * maxY)], someStats) }, timeOut);
		monsterIntervals.push(interval);
	}
}
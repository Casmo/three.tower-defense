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
		gameStarted = false;
		return true;
	}
	x = 0;
	maxY = Math.floor(boardSize.z / tileSize) - 1;
	timeOut = 0;
	countMonsters = Math.ceil(currentWave * 0.80) + currentWave;
	currentMonsters = countMonsters;
	
	someStats = new Object();
	someStats.hp = Math.round((currentWave+1) * 67);
	
	someStats.speed = 0.125;
	someStats.currency = Math.round(Math.random() * 2) + 1;
	someStats.type = 1;

	if (currentWave > 24) {
		someStats.type = 5;
		someStats.hp *= 38;
		currentMonsters = 2;
		someStats.currency += 50;
	}
	else if (currentWave > 23) {
		someStats.type = 5;
		someStats.hp *= 60;
		currentMonsters = 1;
		someStats.currency += 50;
	}
	else if (currentWave > 20) {
		someStats.type = 4;
		someStats.hp *= 4.6;
		someStats.currency += 10;
	}
	else if (currentWave > 15) {
		someStats.type = 4;
		someStats.hp *= 4.5;
		someStats.currency += 7;
	}
	else if (currentWave > 10) {
		someStats.type = 3;
		someStats.hp *= 3;
		someStats.currency += 3;
	}
	else if (currentWave > 5) {
		someStats.type = 2;
		someStats.hp *= 1.5;
		someStats.currency += 2;
	}
	
	if (currentMonsters > 29) {
		currentMonsters = 29;
	}

	someStats.hp_100 = someStats.hp;
	
	timePerMonsterInMs = 650;
	timeOut = 0;
	for (i = 0; i < currentMonsters; i++) {
		timeOut = timeOut + timePerMonsterInMs;
		interval = setTimeout(function() { spawnMonster(tilesSizes[0][Math.floor(Math.random() * maxY)], someStats) }, timeOut);
		monsterIntervals.push(interval);
	}
}
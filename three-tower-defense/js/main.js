/**
 * Three.js testing playground
 * A simple world in outer-space where two words of chaos and order collide.
 * @author Mathieu de Ruiter (www.fellicht.nl)
 */
var camera, controls, scene, renderer, projector, sunLight, sunLightTimer = 300,
	monsterModels = new Array(), loader, manager, rockBottom,
	explosions = new Array(), particleCount = 25, currentWave = 0, currentMonsters = 0,
	addExtraHP = 0,	coins = new Array(), gameStarted = false,
	healthBars = new Array(), maxWaves = 25,
	tower01, basePosY = 0, bulletTweens = new Array(), monsterIntervals = new Array();

function newGame() {
	gameStarted = false;
	towers.forEach(function(tower, key, theArray) {
		destroyTower(key);
	});
	monsters.forEach(function(monster, key, theArray) {
		deleteMonster(key, false);
	});
	coins.forEach(function(coin, index) {
		scene.remove(coins[index]);
		delete coins[index];
	});
	bullets.forEach(function(bullet, index) {
		scene.remove(bullets[index]);
		delete bullets[index];
	});
	monsterIntervals.forEach(function(interval, index) {
		clearTimeout(monsterIntervals[index]);
	});
	monsterIntervals = new Array();
	bullets = new Array();
	healthBars = new Array();
	monsters = new Array();
	towers = new Array();
	sunLightTimer = 300;
	monsterModels = new Array();
	//explosions = new Array();
	currentWave = 0;
	currentMonsters = 0;
	addExtraHP = 0;
	coins = new Array();
	maxWaves = 25;
	bulletTweens = new Array();
	score.currency = 15;
	score.lives = 20;
	document.getElementById('spawn_waves').innerHTML = 'START GAME';
	document.getElementById('spawn_percent').style.width = '1%';
	deselectTiles();
	document.getElementById('lives').innerHTML = score.lives;
	updateCurrency();
}
/**
 * @param object skyBox
 * The skybox of the envoirement. Can be animated
 */
var skyBox = '';

/**
 * Score of the player
 */
var score = new Object();
score.currency = 15;
score.lives = 20;

/**
 * @param array tiles
 * Tiles are the building platforms of the towers. Each tile hold information like
 * position, current tower, accessable, etc.
 * When a player clicks on one of those tiles a new building menu will be showed and
 * allows player to build or upgrade a tower on this tile.
 */
var tiles = new Array();
var tilesSizes = new Array(); // Same array as above except accessable by [x][y]
var nodes = new Array(); // The path array for calculating shortest route [x][y]
var Graph = new Graph([]);

/**
 * @param array towers
 * Towers that are places on one of the Tiles. The index of the array should be the
 * same as the tile index.
 */
var towers = new Array();

/**
 * @param array monsters
 * Monsters that has been spawned with the position and stats
 */
var monsters = new Array();

/**
 * The bullets created by towers
 */
var bullets = new Array();

/**
 * @param object buildmenu
 * The DOM element of the build menu (HTML <div>)
 */
var buildMenu;

/**
 * Basis start point of the game board
 */
var basisX = (boardSize.x/2) + (tileSize/2);
var basisY = (boardSize.z/2) + (tileSize/2);

preLoader();

/**
 * Load models before initial the game
 */
function preLoader() {
	manager = new THREE.LoadingManager();
	texture = new THREE.Texture();
	loader = new THREE.ImageLoader(manager);
	loader.load('files/models/rock_bottom.jpg', function (image) {
		texture.image = image;
		texture.needsUpdate = true;
	} );

	textureTower = new THREE.Texture();
	loader = new THREE.ImageLoader(manager);
	loader.load('files/models/tower_01.jpg', function (image) {
		textureTower.image = image;
		textureTower.needsUpdate = true;
	} );
	
	textureTower02 = new THREE.Texture();
	loader = new THREE.ImageLoader(manager);
	loader.load('files/models/tower_02.jpg', function (image) {
		textureTower02.image = image;
		textureTower02.needsUpdate = true;
	} );
	
	textureTower03 = new THREE.Texture();
	loader = new THREE.ImageLoader(manager);
	loader.load('files/models/tower_03.jpg', function (image) {
		textureTower03.image = image;
		textureTower03.needsUpdate = true;
	} );
	
	textureUfo = new THREE.Texture();
	loader = new THREE.ImageLoader(manager);
	loader.load('files/models/enemy01.jpg', function (image) {
		textureUfo.image = image;
		textureUfo.needsUpdate = true;
	} );
	
	loader = new THREE.OBJLoader(manager);
	loader.load('files/models/rock_bottom.obj', function (object) {

		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = texture;
			}
		} );
		rockBottom = object;
		
		loader = new THREE.OBJLoader(manager);
		loader.load('files/models/tower_01.obj', function (object) {

			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material.map = textureTower;
				}
			} );
			window.tower01Model = object.children[0];
			loader = new THREE.OBJLoader(manager);
			loader.load('files/models/tower_02.obj', function (object) {

				object.traverse( function ( child ) {
					if ( child instanceof THREE.Mesh ) {
						child.material.map = textureTower02;
					}
				} );
				window.tower02Model = object.children[0];

				loader = new THREE.OBJLoader(manager);
				loader.load('files/models/tower_03.obj', function (object) {

					object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
							child.material.map = textureTower03;
						}
					} );
					window.tower03Model = object.children[0];
					
					loader = new THREE.OBJLoader(manager);
					loader.load('files/models/ufo.obj', function (object) {

						object.traverse( function ( child ) {
							if ( child instanceof THREE.Mesh ) {
								child.material.map = textureUfo;
							}
						} );
						window.ufo = object.children[0];
						init();
					});
				});
			} );
		} );
	} );
	if (devMode == true) {
		var stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms

		// Align top-left
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.right = '0px';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = '101';


		document.body.appendChild( stats.domElement );

		setInterval( function () {

		    stats.begin();

		    // your code goes here

		    stats.end();

		}, 1000 / 60 );
	}
}

/**
 * Initial the game/demonstration
 */
function init() {
	document.getElementById('lives').innerHTML = score.lives;
	updateCurrency();
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({antialias:true,maxLights: 10});
	renderer.setSize(window.innerWidth, window.innerHeight);
	if (detailLevel == 'high') {
		renderer.shadowMapEnabled = true;
	}
	
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.x = 90;
	camera.position.y = boardSize.z;
	camera.position.z = boardSize.z * 1.5;
	camera.lookAt(scene.position);
	scene.add(camera);
	document.body.appendChild(renderer.domElement);
	
	// Listerners
	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('mouseup', onDocumentMouseUp, false);
	
	// Camera controls
	controls = new THREE.OrbitControls(camera);
	controls.addEventListener('change', render);
	
	// Lights
	var light = new THREE.AmbientLight( 0x16080c ); // soft white light
	scene.add( light );
	sunLight = new THREE.SpotLight(0xffffff);
	sunLight.position.set(-256, 86, 0);
	sunLight.intensity = 1.90;
	if (devMode == true) {
		sunLight.shadowCameraVisible = true;
	}
	sunLight.shadowDarkness = 0.20;
	sunLight.castShadow = true;
	scene.add(sunLight);
	
	rockBottom.scale.x = 0.125;
	rockBottom.scale.y = 0.125;
	rockBottom.scale.z = 0.125;
	if (detailLevel != 'low') {
		rockBottom.position.set(0,0-(boardSize.y/2),0);
		scene.add(rockBottom);
	}
	
	// Create planets
	planet = new Planet(THREE);
	planet.position.x = boardSize.x / 2;
	planet.position.y = boardSize.z / 2;
	planet.position.z = 0;
	planet.create();
	moon = planet.getObject();
	if (detailLevel == 'high') {
		moon.castShadow = true;
	}
	scene.add(moon);
	planet = new Planet(THREE);
	planet.position.x = 0 - (boardSize.x / 2);
	planet.position.y = boardSize.z / 2;
	planet.position.z = 0;
	planet.color = 0xff8800;
	planet.ambient = 0x404040;
	planet.create();
	mars = planet.getObject();
	if (detailLevel == 'high') {
		mars.castShadow = true;
	}
	scene.add(mars);
	
	// Create floor
	textureGrass = new THREE.ImageUtils.loadTexture('images/grass.jpg');
	materialGrass = new THREE.MeshLambertMaterial (
		{
			map: textureGrass
		}
	);
	geometryFloor = new THREE.CubeGeometry(boardSize.x, boardSize.y, boardSize.z);
	floor = new THREE.Mesh(geometryFloor, materialGrass);
	floor.position.set(0, 0, 0);
	floor.receiveShadow = true;
	scene.add(floor);
	
	basePosY = 1;
	floor.position.y = basePosY;
	rockBottom.position.y = (basePosY) - (boardSize.y / 2);
	
	// Create tiles
	var count = 0;
	for (var x = 0; x < (boardSize.x / tileSize); x++) {
		nodes[x] = [];
		tilesSizes[x] = [];
		for (var y = 0; y < (boardSize.z / tileSize); y++) {
			nodes[x][y] = new GraphNode(x, y, 1);
			
			tile = new Tile(THREE);
			tile.position.x = calculateXPosition(x);
			tile.position.y = 0.1 + ((boardSize.y / 2) + (basePosY));
			tile.position.z = calculateYPosition(y);

			if (detailLevel == 'high') {
				tile.castShadow = true;
				tile.receiveShadow = true;
			}

			// Make the tile a little smaller to fit nicely on the map
			tile.size.x = tileSize - 0.25;
			tile.size.z = tileSize - 0.25;
			
			// Add hight for the tile
			// The first row is to spawn monsters
			if (x == 0) {
				tile.texture = 'images/grass-moss.jpg';
			}
			if (x == (boardSize.x / tileSize) - 1) {
				tile.texture = 'images/grass-moss.jpg';
			}
			tile.create();
			tiles[count] = tile.getObject();
			tiles[count].x = x;
			tiles[count].y = y;
			tiles[count].size = tile.size;
			tilesSizes[x][y] = tiles[count];
			if (x == 0) {
				tiles[count].callback = function() { if (devMode == true) { spawnMonster(this); } else { return; } }
			}
			else if (x == (boardSize.x / tileSize)-1) {
				tiles[count].callback = function() { return; }
			}
			else {
				indexCount = count;
				tiles[count].callback = function() { return showBuildmenu(this); }
			}
			tiles[count].index = count;
			scene.add(tiles[count]);
			count++;
		}
	}
	
	// Skybox
	if (detailLevel == 'high' || detailLevel == 'medium') {
		imagePrefix = "images/skybox/stars-";
		directions  = ["xpos", "xneg", "xpos", "xpos", "xpos", "xpos"];
		imageSuffix = ".jpg";
		skyGeometry = new THREE.CubeGeometry(768,768,768);	
		materialArray = [];
		for (var i = 0; i < 6; i++)
			materialArray.push( new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
				side: THREE.BackSide
			}));
		skyMaterial = new THREE.MeshFaceMaterial(materialArray);
		skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
		skyBox.position.set(0, 128, 0);
		scene.add(skyBox);
	}
	
	projector = new THREE.Projector();
	buildMenu = document.getElementById('buildmenu');
	animate();
}

function render() {
	if (detailLevel == 'medium' || detailLevel == 'high') {
		moon.rotation.y += 0.0015;
		mars.rotation.y -= 0.0020;
	}
	for (i = 0; i < tiles.length; i++) {
		if (tiles[i].selected != undefined && tiles[i].selected == true) {
			activeTimer = Date.now() * 0.00525;
			tiles[i].rotation.z += 0.008;
			tiles[i].position.y = floor.position.y + (boardSize.y) + (Math.sin(activeTimer) * 2);
			if (towers[i] != undefined) {
				// Active tower has to be on top of the selected tile as well (for updating)
				towers[i].position.y = tiles[i].position.y + towers[i].heightPos;
				towers[i].rotation.y += 0.008;
			}
		}
	}
	// Move monsters
	monsters.forEach(function(monster, i, theArray) {
		tmpMX = calculateXPosition(monsters[i].nextStep.x);
		tmpMY = calculateYPosition(monsters[i].nextStep.y);
		healthBars[i].position.y = monsters[i].position.y + 5;
		monsters[i].rotation.y += 0.03;
		if (tmpMX > monsters[i].position.x) {
			monsters[i].position.x += monsters[i].stats.speed;
			healthBars[i].position.x += monsters[i].stats.speed;
		}
		else if (tmpMX < monsters[i].position.x) {
			monsters[i].position.x -= monsters[i].stats.speed;
			healthBars[i].position.x -= monsters[i].stats.speed;
		}
		else if (tmpMY > monsters[i].position.z) {
			monsters[i].position.z += monsters[i].stats.speed;
			healthBars[i].position.z += monsters[i].stats.speed;
		}
		else if (tmpMY < monsters[i].position.z) {
			monsters[i].position.z -= monsters[i].stats.speed;
			healthBars[i].position.z -= monsters[i].stats.speed;
		}
		// @todo fix correct position check
		if (tmpMX == monsters[i].position.x && tmpMY == monsters[i].position.z) {
			// Calculate nextStep
			monsters[i].setNodes();
		}
		if (monsters[i].currentStep.x == monsters[i].end.x && monsters[i].currentStep.y == monsters[i].end.y) {
			deleteMonster(i, true);
		}
	});
	towers.forEach(function(tower, key, theArray) {
		shootAtMonsterInRange(tower, key);
	});

	bullets.forEach(function(bullet, i, theArray) {
		bullets[i].position.x = bulletTweens[i].stop.x;
		bullets[i].position.y = bulletTweens[i].stop.y;
		bullets[i].position.z = bulletTweens[i].stop.z;
	});
	for (i = 0; i < explosions.length; i++) {
		removeParticleSystem = false;
		for (p = 0; p < particleCount; p++) {
			oldParticle = explosions[i].geometry.vertices[p];
			particle = new THREE.Vector3(oldParticle.x + oldParticle.speed.x, oldParticle.y + oldParticle.speed.y, oldParticle.z + oldParticle.speed.z);
			particle.speed = new Object();
			particle.speed.x = oldParticle.speed.x * 0.97;
			particle.speed.y = oldParticle.speed.y * 0.97;
			particle.speed.z = oldParticle.speed.z * 0.97;
			explosions[i].geometry.vertices[p] = particle;
			if(particle.speed.x < 0.001 && particle.speed.x > -0.001 && particle.speed.y < 0.001 && particle.speed.y > -0.001 && particle.speed.z < 0.001 && particle.speed.z > -0.001) {
				removeParticleSystem = true;
			}
		}
		explosions[i].geometry.__dirtyVertices = true;
		explosions[i].geometry.dynamic = true;
		explosions[i].geometry.verticesNeedUpdate = true;
		explosions[i].geometry.normalsNeedUpdate = true;
		if (removeParticleSystem == true) {
			scene.remove(explosions[i]);
			explosions.splice(i, 1);
		}
	}
	coins.forEach(function(coin, index) {
		positionY = coins[index].lifeTime - 10;
		positionY = Math.round(positionY*12)/100;
		coins[index].position.y += positionY;
		coins[index].rotation.y += 0.1;
		coins[index].lifeTime--;
		if (coins[index].lifeTime <= -5) {
			scene.remove(coins[index]);
			delete coins[index];
		}
	});
	TWEEN.update();
	renderer.render(scene, camera);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

function startGame() {
	currentWave = 0;
	gameStarted = true;
	spawnWave();
}

/**
 * Spawns a monster on a tile and push it into the monsters array
 * @param Object tile the spawning tile
 */
function spawnMonster(tile, extraStats) {
	if (score.lives <= 0) {
		return false;
	}
	if (tile == undefined) {
		currentMonsters--;
		return false;
	}
	if (typeof extraStats == 'undefined') {
		extraStats = new Object();
		extraStats.type = 1;
	}
	monster = new Monster(THREE, extraStats.type);
	monster.position.x = tile.position.x;
	monster.position.y = basePosY + tile.position.y + (monster.size.x / 2);
	monster.position.z = tile.position.z;
	monster.create();
	monsterObject = monster.getObject();
	if (detailLevel == 'high') {
		monsterObject.castShadow = true;
	}
	monsterObject.end = monster.end;
	monsterObject.currentStep = monster.currentStep;
	monsterObject.nextStep = monster.nextStep;
	monsterObject.setNodes = monster.setNodes;
	monsterObject.stats = monster.stats;
	if (extraStats.hp != undefined) {
		monsterObject.stats.hp = extraStats.hp;
	}
	if (extraStats.hp_100 != undefined) {
		monsterObject.stats.hp_100 = extraStats.hp_100;
	}
	if (extraStats.speed != undefined) {
		monsterObject.stats.speed = extraStats.speed;
	}
	if (extraStats.currency != undefined) {
		monsterObject.stats.currency = extraStats.currency;
	}
	
	var materialHealthBar = new THREE.LineBasicMaterial({
		color: 0xff0000
    });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3((tile.size.x * 0.9), 0, 0));
    geometry.verticesNeedUpdate = true;
    geometry.elementsNeedUpdate = true;
    geometry.morphTargetsNeedUpdate = true;
    geometry.uvsNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    geometry.colorsNeedUpdate = true;
    geometry.tangentsNeedUpdate = true;
    geometry.dynamic = true;
    var line = new THREE.Line(geometry, materialHealthBar);
    line.position = monster.position;
    line.position.y = monster.position.y + monster.size.y + 5;
    line.position.x -= ((tile.size.x * 0.9) / 2);
    
    healthBars.push(line);
    scene.add(healthBars[healthBars.length-1]);
	
	monsters.push(monsterObject);
	scene.add(monsters[monsters.length-1]);
}

/**
 * Despawn or kill a monster
 * @param int index the global index in the monsters array
 * @param removeLife boolean whether to remove a life of the scoreboard
 */
function deleteMonster(index, removeLife) {
	if (removeLife == true) {
		score.lives--;
		if (score.lives <= 0) {
			score.lives = 0;
			towers.forEach(function(tower, key, theArray) {
				destroyTower(key);
			});
			for (i = 0; i < bullets.length; i++) {
				scene.remove(bullets[i]);
				bullets.splice(i, 1);
			}
		}
		document.getElementById('lives').innerHTML = score.lives;
	}
	else {
		// killed, add currency
		score.currency += monsters[index].stats.currency;
		updateCurrency();
		createExplosion(monsters[index].position);
		createCoin(monsters[index].position);
	}
	towers.forEach(function(tower) {
		if (tower.shootingTargetIndex == index) {
			tower.isShooting = false;
			tower.shootingTarget = '';
		}
	});
	scene.remove(healthBars[index]);
	scene.remove(monsters[index]);
	delete monsters[index];
	delete healthBars[index];
	currentMonsters--;
	if (currentMonsters <= 0 && gameStarted == true) {
		setTimeout(function() { spawnWave(); }, 3500);
	}
}

/**
 * Shoot at a monster in the range of the tower
 * @param tower
 * @param towerIndex the index (array key) of the tower
 */
function shootAtMonsterInRange(tower, towerIndex) {
	//if (typeof(tower.lastShootingTime) == 'undefined' || ((Date.now() - tower.lastShootingTime) / 30) > tower.stats.speed) {
	if (typeof tower.hasBullet == 'undefined' || tower.hasBullet == false) {
		// Let's check if it has to shoot
		towers[towerIndex].lastShootingTime = Date.now();
		// Check if the last monster is still in range, if there is a last target
		if (tower.shootingTargetIndex != undefined && monsters[tower.shootingTargetIndex] != undefined && isInRange(tower, monsters[tower.shootingTargetIndex])) {
			createBullet(tower, tower.shootingTargetIndex, towerIndex);
		}
		else {
			monsterIndex = getMonsterInRange(tower);
			if (typeof monsterIndex == 'number') {
				createBullet(tower, monsterIndex, towerIndex);
				towers[towerIndex].shootinggTargetIndex = monsterIndex;
				towers[towerIndex].isShoooting = true;
			}
		}
	}
}

/**
 * Get a monster in range of the tower
 * @param tower the object of the tower
 * @return the index of the monster
 * @todo randomize the monster or get the closest
 */
function getMonsterInRange(tower) {
	closestToExit = -1000;
	monsterClosestIndex = '';
	monsters.forEach(function(monster, index) {
		currentX = monster.position.x + 1000;
		if (isInRange(tower, monster)) {
			if (currentX > closestToExit) {
				closestToExit = currentX;
				monsterClosestIndex = index;
			}
		}
	});
	if (typeof monsterClosestIndex == 'number') {
		return monsterClosestIndex;
	}
	return false;
}

/**
 * Check if the monster is in shooting range of the tower
 * @param tower Tower Object
 * @param monster Monster Object
 * @returns {Boolean} whether the monster is in shooting range of the tower
 */
function isInRange(tower, monster) {
	x = calculateX(tower.position.x);
	y = calculateY(tower.position.z);
	minX = x - tower.stats.range;
	maxX = x + tower.stats.range;
	minY = y - tower.stats.range;
	maxY = y + tower.stats.range;
	monsterX = calculateX(monster.position.x);
	monsterY = calculateY(monster.position.z);
	if (minX <= monsterX && maxX >= monsterX && minY <= monsterY && maxY >= monsterY) {
		return true;
	}
	return false;
}

/**
 * Create a bullet at the tower spot and move it to the monster.
 */
function createBullet(tower, targetIndex, towerIndex) {
	newTween = new Object();
	towers[towerIndex].hasBullet = true;
	someBullet = tower.projectile;
	someBullet.position.set(tower.position.x, (tower.position.y + someBullet.startY), tower.position.z);
	someBullet.end = new Object()
	someBullet.end.x = monsters[targetIndex].position.x;
	someBullet.end.y = monsters[targetIndex].position.y;
	someBullet.end.z = monsters[targetIndex].position.z;
	start = someBullet.position;
	end = someBullet.end;
	someTween = new TWEEN.Tween(start).to(end, 300);
	if (someBullet.easing == 'Back.Out') {
		someTween.easing(TWEEN.Easing.Back.Out);
	}
	else if (someBullet.easing == 'Quadratic.In') {
		someTween.easing(TWEEN.Easing.Quadratic.In);
	}
	var currentIndex = bullets.length;
	setTimeout(function(){removeBullet(currentIndex)}, 300);
	someTween.start();
	bulletTweens.push(someTween);
	someBullet.stats = tower.stats;
	someBullet.targetIndex = targetIndex;
	someBullet.towerIndex = towerIndex;
	
	bullets.push(someBullet);
	scene.add(bullets[bullets.length-1]);
	setTimeout(function() {
		if (towers[towerIndex] != undefined) {
			towers[towerIndex].hasBullet = false;
		}
	}, someBullet.stats.speed);
}

function removeBullet(index) {
	if (typeof bullets[index] == 'undefined') {
		return false;
	}
	bullet = bullets[index];
	if (monsters[bullet.targetIndex] != undefined) {
		monsters[bullet.targetIndex].stats.hp -= bullet.stats.damage;
		percent = 100 / (monsters[bullet.targetIndex].stats.hp_100 / monsters[bullet.targetIndex].stats.hp);
		healthBars[bullet.targetIndex].scale.x = 1 / 100 * percent;
	}
	if (monsters[bullet.targetIndex] != undefined && monsters[bullet.targetIndex].stats.hp <= 0) {
		deleteMonster(bullet.targetIndex, false);
	}
	scene.remove(bullets[index]);
	delete bullets[index];
}

/**
 * Build a building on the selected tile
 * @param int buildingIndex the index of the building
 * @todo check from individual monsters
 */
function build(buildingIndex) {
	if (score.lives <= 0 || buildings[buildingIndex] == undefined) {
		return false;
	}
	for (i = 0; i < tiles.length; i++) {
		if (tiles[i].selected == true) {
			if (towers[i] != undefined) {
				// @todo UPGRADE tower
				hideBuildmenu();
				return true;
			}
			if ((score.currency - buildings[buildingIndex].costs) < 0) {
				return false;
			}
			building = buildings[buildingIndex].mesh();
			building.position.x = tiles[i].position.x;
			building.position.y = tiles[i].position.y + building.heightPos;
			building.position.z = tiles[i].position.z;
			building.stats = buildings[buildingIndex].stats;
			building.isShooting = false;
			building.shootingTarget = '';
			building.projectile = buildings[buildingIndex].projectile();
			building.size = buildings[buildingIndex].size;
			building.heightPos = buildings[buildingIndex].heightPos;
			building.lastShootingTime = Date.now();
			if (detailLevel == 'high') {
				building.castShadow = true;
				building.receiveShadow = true;
			}
			nodes[tiles[i].x][tiles[i].y].type = 0;
			if (isValidPath() == false) {
				nodes[tiles[i].x][tiles[i].y].type = 1;
			}
			else {
				towers[i] = building;
				scene.add(building);
				score.currency -= buildings[buildingIndex].costs;
				updateCurrency();
			}
			hideBuildmenu();
			return true;
		}
	}
	return false;
}

/**
 * Creates a particle explosion after killing a monster or destroying a tower.
 * @param object position The x, y, z position of the explosion
 */
function createExplosion(position) {
	particles = new THREE.Geometry();
	pMaterial = new THREE.ParticleBasicMaterial({
		color: 0xFFFFFF,
		size: 1.25
    });
	for (var p = 0; p < particleCount; p++) {
		  pX = position.x;
	      pY = position.y;
	      pZ = position.z;
	      speed = new Object();
	      speed.x = Math.random() * 0.5;
	      speed.y = Math.random() * 0.5;
	      speed.z = Math.random() * 0.5;
	      particle = new THREE.Vector3(pX, pY, pZ);
	      particle.speed = speed;
	      particles.vertices.push(particle);
	}
	particleSystem = new THREE.ParticleSystem(
	    particles,
	    pMaterial
    );
	particleSystem.sortParticles = true;
	explosions.push(particleSystem);
	scene.add(explosions[explosions.length-1]);
}

/**
 * Creates a coin and animate it in th render().
 * @param object position The x, y, z position of the coin
 */
function createCoin(position) {
	coinMaterial = new THREE.MeshBasicMaterial({color: 0xfffc00});
	coin = new THREE.Mesh( 
			new THREE.CylinderGeometry(2, 2, 1, 12, 2), 
			coinMaterial);
	coin.position.set(position.x, position.y, position.z);
	coin.rotation.z = 67.5;
	coin.rotation.y = Math.random() * 360;
	coin.lifeTime = 30;
	coins.push(coin);
	scene.add(coins[(coins.length-1)]);
}

/**
 * Calculate the travel speed (x, y, z) of a bullet
 * @param object startPosition Holds the x, y and z position of the current position
 * @param object endPosition Holds the x, y and z position of the target (end of the bullet)
 * @param int speed the speed that the bullet will travel
 */
function calculateBulletSpeed(startPosition, endPosition, speed) {
	bulletSpeed = new Object();
	vector = new Object();
	vector.x = endPosition.x - startPosition.x;
	vector.y = endPosition.y - startPosition.y;
	vector.z = endPosition.z - startPosition.z;
	// (c) Pythagoras
	distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
	c = distance / speed;
	bulletSpeed.x = vector.x / c;
	bulletSpeed.y = vector.y / c;
	bulletSpeed.z = vector.z / c;
	return bulletSpeed;
}

function destroyTower(index) {
	if (towers[index] != undefined) {
		scene.remove(towers[index]);
		createExplosion(towers[index].position);
		delete towers[index];
		nodes[tiles[index].x][tiles[index].y].type = 1;
	}
}

/**
 * Convert X and Y to the position in the world back and forth.
 */
function calculateX(xPosition) {
	return Math.floor(0 - (((0 - basisX) - xPosition) / tileSize) - 1);
}
function calculateY(yPosition) {
	return Math.floor(0 - (((0 - basisY) - yPosition) / tileSize) - 1);
	
}
function calculateXPosition(x) {
	return 0 - basisX + (tileSize * (x+1));
	
}
function calculateYPosition(y) {
	return 0 - basisY + (tileSize * (y+1));
}

/**
 * Check whether the maze is open or closed.
 * @param int startX the starting X node
 * @param int startY the starting Y nodes
 * @param int endX the ending X nodes
 * @param int endY the ending Y nodes
 * @returns {Boolean} whether the maze is open or closed seen from above params.
 */
function isValidPath(startX, startY, endX, endY) {
	if (typeof startX == 'undefined') {
		startX = 0;
	}
	if (typeof startY == 'undefined') {
		startY = 0;
	}
	if (typeof endX == 'undefined') {
		endX = (boardSize.x / tileSize)-1;
	}
	if (typeof endY == 'undefined') {
		endY = (boardSize.z / tileSize)-1;
	}
	Graph.nodes = nodes;
	start = nodes[startX][startY];
	end = nodes[endX][endY];
	result = astar.search(Graph.nodes, start, end);
	if (result == '') {
		return false;
	}
	return true;
}

function updateCurrency() {
	document.getElementById('currency').innerHTML = score.currency;
}

/**
 * Callback when the player resizes the current browser window.
 */
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Callback when the player clicks on the document.
 * @param object event the click event
 * @todo I would like to have this only activated when the player clicked UP & DOWN
 * on the tile instead of just UP or DOWN.
 */
function onDocumentMouseUp(event) {
    event.preventDefault();
    var vector = new THREE.Vector3( 
        (event.clientX / window.innerWidth) * 2 - 1, 
        - (event.clientY / window.innerHeight) * 2 + 1, 
        0.5);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = ray.intersectObjects(tiles);
    if (intersects.length > 0) {
    	return intersects[0].object.callback();
    }
}

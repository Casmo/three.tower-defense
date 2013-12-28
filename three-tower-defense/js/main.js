/**
 * Three.js testing playground
 * A simple world in outer-space where two words of chaos and order collide.
 * @author Mathieu de Ruiter (www.fellicht.nl)
 */

var camera, controls, scene, renderer, projector, sunLight, sunLightTimer = 300, monsterModels = new Array(), loader, manager, rockBottom;

/**
 * @param object skyBox
 * The skybox of the envoirement. Can be animated
 */
var skyBox = '';

/**
 * Score of the player
 */
var score = new Object();
score.currency = 100;
score.lives = 25;

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
	loader.load( 'files/models/rock_bottom.jpg', function ( image ) {
		texture.image = image;
		texture.needsUpdate = true;
	} );
	loader = new THREE.OBJLoader(manager);
	loader.load('files/models/rock_bottom.obj', function ( object ) {

		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = texture;
			}
		} );
		rockBottom = object;
		setTimeout("init();", 2000);
	} );
}

/**
 * Initial the game/demonstration
 */
function init() {
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	if (detailLevel == 'high') {
		renderer.shadowMapEnabled = true;
	}
	
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000000
	);
	camera.position.x = 0;
	camera.position.y = 512;
	camera.position.z = 512;
	camera.lookAt(scene.position);
	scene.add(camera);
	document.body.appendChild(renderer.domElement);
	
	// Listerners
	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('mousedown', onDocumentMouseDown, false);
	
	// Camera controls
	controls = new THREE.OrbitControls(camera);
	controls.addEventListener('change', render);
	
	// Lights
	sunLight = new THREE.SpotLight(0xffff00);
	sunLight.position.set(0 - boardSize.x, 512, 0);
	scene.add(sunLight);
	sunLight.intensity = 2;
	if (devMode == true) {
		sunLight.shadowCameraVisible = true;
	}
	if (detailLevel == 'high') {
		sunLight.shadowDarkness = 0.70;
		sunLight.castShadow = true;
	}
	var ambientLight = new THREE.AmbientLight(0x404040);
	scene.add(ambientLight);
	rockBottom.position.set(0,0-(boardSize.y/2),0);
	scene.add(rockBottom);
	
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
	
	// Create tiles
	var count = 0;
	for (var x = 0; x < (boardSize.x / tileSize); x++) {
		nodes[x] = [];
		tilesSizes[x] = [];
		for (var y = 0; y < (boardSize.z / tileSize); y++) {
			nodes[x][y] = new GraphNode(x, y, 1);
			
			tile = new Tile(THREE);
			tile.position.x = calculateXPosition(x); // 1 + (tileSize / 2) - (boardSize.x / 2) + (x * tileSize);
			tile.position.y = boardSize.y / 2;
			tile.position.z = calculateYPosition(y); // 1 + (tileSize / 2) - (boardSize.z / 2) + (y * tileSize);

			// Make the tile a little smaller to fit nicely on the map
			tile.size.x = tileSize - 4;
			tile.size.z = tileSize - 4;
			
			// Add hight for the tile
			if (detailLevel == 'high') {
				randomHeight = Math.random()*16 + 4;
			}
			else {
				randomHeight = 4;
			}
			// The first row is to spawn monsters
			if (x == 0) {
				randomHeight = 22;
				tile.texture = 'images/grass-moss.jpg';
			}
			if (x == (boardSize.x / tileSize) - 1) {
				randomHeight = 2;
				tile.texture = 'images/grass-moss.jpg';
			}
			tile.size.y = randomHeight;
			tile.position.y += (boardSize.y + randomHeight) * 2;
			tile.position.y = 1 + (boardSize.y / 2);
			tile.create();
			tiles[count] = tile.getObject();
			tiles[count].x = x;
			tiles[count].y = y;
			tiles[count].size = tile.size;
			tilesSizes[x][y] = tiles[count];
			if (x == 0) {
				tiles[count].callback = function() { return spawnMonster(this); }
			}
			else if (x == (boardSize.x / tileSize)-1) {
				tiles[count].callback = function() { return; }
			}
			else {
				tiles[count].callback = function() { return showBuildmenu(this); }
			}
			tiles[count].height = randomHeight;

			if (detailLevel == 'high') {
				tiles[count].castShadow = true;
				tiles[count].receiveShadow = true;
			}
			scene.add(tiles[count]);

			count++;
		}
	}
	
	// Skybox
	if (detailLevel == 'high') {
		imagePrefix = "images/skybox/stars-";
		directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
		imageSuffix = ".png";
		skyGeometry = new THREE.CubeGeometry(4096, 4096, 4096);	
		materialArray = [];
		for (var i = 0; i < 6; i++)
			materialArray.push( new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
				side: THREE.BackSide
			}));
		skyMaterial = new THREE.MeshFaceMaterial(materialArray);
		skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
		skyBox.position.set(0, 1024, 0);
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
	if (detailLevel == 'high') {
		// Calculate skybox rotation and light rotation
		sunLightTimer += 0.0014; // @todo finetune
		sunLight.position.z = Math.cos(sunLightTimer) * 1024;
		sunLight.position.x = Math.sin(sunLightTimer) * 1024;
		skyBox.rotation.y += 0.00015;
		
		timer = Date.now() * 0.001;
		floor.position.y = Math.sin(timer) * 16;
		rockBottom.position.y = (Math.sin(timer) * 16) - (boardSize.y / 2);
		for (i = 0; i < tiles.length; i++) {
			tiles[i].position.y = 1 + ((boardSize.y / 2) + (Math.sin(timer) * 16));
			if (towers[i] != undefined) {
				towers[i].position.y = tiles[i].position.y + (tileSize / 2) + (tiles[i].height / 2);
			}
			if (tiles[i].selected != undefined && tiles[i].selected == true) {
				tiles[i].rotation.y += 0.008;
				activeTimer = Date.now() * 0.005;
				tiles[i].position.y = floor.position.y + (boardSize.y) + (Math.sin(activeTimer) * 8);
				if (towers[i] != undefined) {
					// Active tower has to be on top of the selected tile as well (for updating)
					towers[i].position.y = tiles[i].position.y + (tileSize / 2) + (tiles[i].height / 2);
					towers[i].rotation.y += 0.008;
				}
			}
			else {
				tiles[i].rotation.y = 0;
			}
		}
	}
	// Move monsters
	for (i = 0; i < monsters.length; i++) {
		tmpMX = calculateXPosition(monsters[i].nextStep.x);
		tmpMY = calculateYPosition(monsters[i].nextStep.y);
		if (tmpMX > monsters[i].position.x) {
			monsters[i].position.x += monsters[i].stats.speed;
			if (detailLevel == 'high') {
				monsters[i].rotation.x = 0;
				monsters[i].rotation.y = 0;
				monsters[i].rotation.z -= monsters[i].stats.speed / 25;
			}
		}
		else if (tmpMX < monsters[i].position.x) {
			monsters[i].position.x -= monsters[i].stats.speed;
			if (detailLevel == 'high') {
				monsters[i].rotation.x = 0;
				monsters[i].rotation.y = 0;
				monsters[i].rotation.z += monsters[i].stats.speed / 25;
			}
		}
		else if (tmpMY > monsters[i].position.z) {
			monsters[i].position.z += monsters[i].stats.speed;
			if (detailLevel == 'high') {
				monsters[i].rotation.z = 0;
				monsters[i].rotation.y = 0;
				monsters[i].rotation.x += monsters[i].stats.speed / 25;
			}
		}
		else if (tmpMY < monsters[i].position.z) {
			monsters[i].position.z -= monsters[i].stats.speed;
			if (detailLevel == 'high') {
				monsters[i].rotation.z = 0;
				monsters[i].rotation.y = 0;
				monsters[i].rotation.x -= monsters[i].stats.speed / 25;
			}
		}
		if (tmpMX == monsters[i].position.x && tmpMY == monsters[i].position.z) {
			// Calculate nextStep
			monsters[i].setNodes();
			activateTowers(monsters[i]);
		}
		if (detailLevel == 'high') {
			activeTimer = Date.now() * 0.005;
			monsters[i].position.y = tilesSizes[monsters[i].nextStep.x][monsters[i].nextStep.y].size.y + 32 + ((boardSize.y / 2) + (Math.sin(timer) * 16));
		}
		if (monsters[i].currentStep.x == monsters[i].end.x && monsters[i].currentStep.y == monsters[i].end.y) {
			deleteMonster(i, true);
		}
	} // rr.forEach(function (val, index, theArray) {
	towers.forEach(function(tower, key, theArray) {
		if (tower.isShooting == true) {
			if (typeof(tower.lastShootingTime) == 'undefined') {
				tower.lastShootingTime = Date.now();
				createBullet(tower, tower.shootingTarget);
			}
			else if (((Date.now() - tower.lastShootingTime) / 30) > tower.stats.speed) {
				tower.lastShootingTime = Date.now();
				createBullet(tower, tower.shootingTarget);
			}
		}
		towers[key] = tower;
	});
	// @todo make one smooth direction
	for (i = 0; i < bullets.length; i++) {
		bullets[i].position.x += bullets[i].speed.x;
		bullets[i].position.y += bullets[i].speed.y;
		bullets[i].position.z += bullets[i].speed.z;
		if ((bullets[i].end.x - bullets[i].position.x) < 6 &&
				(bullets[i].end.y - bullets[i].position.y) < 6 &&
				(bullets[i].end.z - bullets[i].position.z) < 6) {
			scene.remove(bullets[i]);
			bullets.splice(i, 1);
		}
	}
	if (1==2) {
		for (i = 0; i < bullets.length; i++) {
			moveX = bullets[i].end.x - bullets[i].position.x;
			moveY = bullets[i].end.y - bullets[i].position.y;
			moveZ = bullets[i].end.z - bullets[i].position.z;
			longestRangeArray = new Array();
			longestRangeArray = [moveX, moveY, moveZ];
			longestRangeArray.sort(function(a,b){return b - a});
			// Bullet Speed may be placed on the towers for a nicer detail
			bulletSpeed = 4;
			steps = longestRangeArray[0] / bulletSpeed;
			if (moveX < 0) {
				moveX = 0 + bulletSpeed;
			}
			else {
				moveX = 0 - bulletSpeed;
			}
			if (moveY < 0) {
				moveY = 0 + bulletSpeed;
			}
			else {
				moveY = 0 - bulletSpeed;
			}
			if (moveZ < 0) {
				moveZ = 0 + bulletSpeed;
			}
			else {
				moveZ = 0 - bulletSpeed;
			}
			
			bullets[i].position.x -= moveX;
			bullets[i].position.y -= moveY;
			bullets[i].position.z -= moveZ;
			if ((bullets[i].end.x - bullets[i].position.x) < 6 &&
					(bullets[i].end.y - bullets[i].position.y) < 6 &&
					(bullets[i].end.z - bullets[i].position.z) < 6) {
				scene.remove(bullets[i]);
				bullets.splice(i, 1);
			}
		}
	}
	renderer.render(scene, camera);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

/**
 * Spawns a monster on a tile and push it into the monsters array
 * @param Object tile the spawning tile
 */
function spawnMonster(tile) {
	monster = new Monster(THREE);
	monster.position.x = tile.position.x;
	monster.position.y = tile.position.y + monster.size.y + tile.size.y;
	monster.position.z = tile.position.z;
	monster.create();
	monsterObject = monster.getObject();
	if (detailLevel == 'high') {
		monsterObject.castShadow = true;
	}
	scene.add(monsterObject);
	monsterObject.end = monster.end;
	monsterObject.currentStep = monster.currentStep;
	monsterObject.nextStep = monster.nextStep;
	monsterObject.setNodes = monster.setNodes;
	monsterObject.stats = monster.stats;
	monsters.push(monsterObject);
}

/**
 * Despawn or kill a monster
 * @param int index the global index in the monsters array
 * @param removeLife boolean whether to remove a life of the scoreboard
 */
function deleteMonster(index, removeLife) {
	scene.remove(monsters[index]);
	monsters.splice(index, 1);
	if (removeLife == true) {
		// @todo remove life!
	}
}

/**
 * Activate towers to shoot at this monster
 * @param Object monster
 */
function activateTowers(monster) {
	towers.forEach(function(tower) {
		x = calculateX(tower.position.x);
		y = calculateY(tower.position.z);
		minX = x - tower.stats.range;
		maxX = x + tower.stats.range;
		minY = y - tower.stats.range;
		maxY = y + tower.stats.range;
		monsterX = calculateX(monster.position.x);
		monsterY = calculateY(monster.position.z);
		if (tower.isShooting == false && minX <= monsterX && maxX >= monsterX && minY <= monsterY && maxY >= monsterY) {
			tower.isShooting = true;
			tower.shootingTarget = monster;
		}
		else if (tower.isShooting == true && tower.shootingTarget == monster && !(minX <= monsterX && maxX >= monsterX && minY <= monsterY && maxY >= monsterY)) {
			tower.isShooting = false;
			tower.shootingTarget = '';
		}
	});
}

/**
 * Create a bullet at the tower spot and move it to the monster.
 */
function createBullet(tower, target) {
	someBullet = tower.projectile;
	someBullet.position.set(tower.position.x, (tower.position.y + tower.size.y), tower.position.z);
	scene.add(someBullet);
	someBullet.end = new Object()
	someBullet.end.x = target.position.x;
	someBullet.end.y = target.position.y;
	someBullet.end.z = target.position.z;
	bulletSpeed = 6;
	
	speed = calculateBulletSpeed(someBullet.position, someBullet.end, bulletSpeed);
	console.log(speed);
	someBullet.speed = speed;
	bullets.push(someBullet);
}

/**
 * Build a building on the selected tile
 * @param int buildingIndex the index of the building
 * @todo check from individual monsters
 */
function build(buildingIndex) {
	if (buildings[buildingIndex] == undefined) {
		return false;
	}
	for (i = 0; i < tiles.length; i++) {
		if (tiles[i].selected == true) {
			if (towers[i] != undefined) {
				// @todo UPGRADE tower
				hideBuildmenu();
				return true;
			}
			building = buildings[buildingIndex].mesh();
			building.position.x = tiles[i].position.x;
			building.position.y = tiles[i].position.y + (tileSize / 2);
			building.position.z = tiles[i].position.z;
			building.stats = buildings[buildingIndex].stats;
			building.isShooting = false;
			building.shootingTarget = '';
			building.projectile = buildings[buildingIndex].projectile();
			building.size = buildings[buildingIndex].size;
			if (detailLevel == 'high') {
				building.castShadow = true;
			}
			nodes[tiles[i].x][tiles[i].y].type = 0;
			if (isValidPath() == false) {
				nodes[tiles[i].x][tiles[i].y].type = 1;
			}
			else {
				towers[i] = building;
				scene.add(building);
			}
			hideBuildmenu();
			return true;
		}
	}
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
	//console.log(distance);
	c = distance / speed;
	console.log(c);
	bulletSpeed.x = vector.x / c;
	bulletSpeed.y = vector.y / c;
	bulletSpeed.z = vector.z / c;
	return bulletSpeed;
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
function onDocumentMouseDown(event) {
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

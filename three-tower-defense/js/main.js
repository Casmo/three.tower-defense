/**
 * Hello Three.js testing playground
 * A simple world in outer-space where two words of chaos and order collide.
 */

var camera, controls, scene, renderer, projector, sunLight, sunLightTimer = 300;

/**
 * @param object skyBox
 * The skybox of the envoirement. Can be animated
 */
var skyBox = '';

/**
 * @param array tiles
 * Tiles are the building platforms of the towers. Each tile hold information like
 * position, current tower, etc.
 * When a player clicks on one of those tiles a new building menu will be showed and
 * allows player to build or upgrade a tower on this tile.
 */
var tiles = new Array();

/**
 * @param array towers
 * Towers that are places on one of the Tiles. The index of the array should be the
 * same as the tile index.
 */
var towers = new Array();

/**
 * @param object buildmenu
 * The DOM element of the build menu (HTML <div>)
 */
var buildMenu;

init();
animate();

/**
 * Initial the game/demonstration
 */
function init() {
	// Basic initial of THREE
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	if (detailLevel == 'high') {
		renderer.shadowMapEnabled = true;
	}
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		10000
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
	
	controls = new THREE.OrbitControls(camera);
	controls.addEventListener('change', render);
	
	// Light
	sunLight = new THREE.SpotLight(0xffff00);
	sunLight.position.set(0 - boardSize.x, 512, 0);
	scene.add(sunLight);
	sunLight.intensity = 2;
	if (detailLevel == 'high') {
		sunLight.shadowCameraVisible = true;
		sunLight.shadowDarkness = 0.70;
		sunLight.castShadow = true;
	}
	
	var ambientLight = new THREE.AmbientLight(0x404040);
	scene.add(ambientLight);
	
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
	for (i = 0; i < (boardSize.x / tileSize); i++) {
		for (j = 0; j < (boardSize.z / tileSize); j++) {
			tile = new Tile(THREE);
			tile.position.x = 1 + (tileSize / 2) - (boardSize.x / 2) + (i * tileSize);
			tile.position.y = boardSize.y / 2;
			tile.position.z = 1 + (tileSize / 2) - (boardSize.z / 2) + (j * tileSize);
			tile.size.x = tileSize - 4;
			tile.size.z = tileSize - 4;
			if (detailLevel == 'high') {
				randomHeight = Math.random()*16 + 4;
			}
			else {
				randomHeight = 4;
			}
			tile.size.y = randomHeight;
			tile.position.y += (boardSize.y + randomHeight) * 2;
			tile.position.y = 1 + (boardSize.y / 2);
			tile.create();
			tiles[count] = tile.getObject();
			tiles[count].callback = function() { showBuildmenu(this); }
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
}

function render() {
	if (detailLevel == 'medium' || detailLevel == 'high') {
		moon.rotation.y += 0.0015;
		mars.rotation.y -= 0.0020;
	}
	if (detailLevel == 'high') {
		
		// Calculate skybox rotation and light rotation
		sunLightTimer += 0.00018; // @todo finetune
		sunLight.position.z = Math.cos(sunLightTimer) * 1024;
		sunLight.position.x = Math.sin(sunLightTimer) * 1024;
		skyBox.rotation.y += 0.00015;
		
		timer = Date.now() * 0.001;
		floor.position.y = Math.sin(timer) * 16;
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
	renderer.render(scene, camera);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
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

/**
 * Callback when a player clicks on a Tile to build or upgrade a tower.
 * @param object tile the Tile that is actived
 */
function showBuildmenu(tile) {
	selectTile(tile);
	buildmenu.innerHTML = '';
	for (i = 0; i < buildings.length; i++) {
		buildmenu.innerHTML += buildings[i].html;
	}
	buildmenu.style.display = 'block';
}

/**
 * Build a building on the selected tile
 * @param int buildingIndex the index of the building
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
			if (detailLevel == 'high') {
				building.castShadow = true;
			}
			scene.add(building);
			towers[i] = building; // Push the new tower to the tower array
			hideBuildmenu();
			return true;
		}
	}
}

/**
 * Hide build menu
 */
function hideBuildmenu() {
	buildmenu.style.display = 'none';
	deselectTiles();
}

/**
 * Select a clicked tile
 */
function selectTile(tile) {
	deselectTiles(); // Make sure nothing is selected
	tile.selected = true;
}

/**
 * Deselect the tiles
 */
function deselectTiles() {
	for (i = 0; i < tiles.length; i++) {
		tiles[i].selected = false;
	}
}
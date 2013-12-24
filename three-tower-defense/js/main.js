/**
 * Hello Three.js testing playground
 * A simple world in outer-space where two words of chaos and order collide.
 */

/**
 * @param object boardSize
 * Holds the default values of the (game)board size. Each side must be an multiple of
 * 2.
 */
var boardSize = new Object();
boardSize.x = 768; // Width
boardSize.y = 64; // Height
boardSize.z = 512; // Depth

/**
 * @param int tileSize
 * The x and y size of a tile. Must be a multiple of 2. Also used for buildings.
 */
var tileSize = 64;

/**
 * @param string detailLevel
 * Set the detail of the level. Options are 'lew', 'medium', 'high'.
 * Default value is low.
 */
var detailLevel = 'high'; // Detail of the level 'low', 'medium', 'high'

var camera, controls, scene, renderer, projector;

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
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.innerWidth, window.innerHeight);
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
	var light = new THREE.PointLight(0xffffff, 0.75);
	light.position.set(0 - boardSize.x, 2048, 0);
	scene.add(light);
	var ambientLight = new THREE.AmbientLight(0x404040);
	scene.add(ambientLight);
	
	// Create planets
	planet = new Planet(THREE);
	planet.position.x = boardSize.x / 2;
	planet.position.y = boardSize.z / 2;
	planet.position.z = 0;
	planet.create();
	moon = planet.getObject();
	scene.add(moon);
	planet = new Planet(THREE);
	planet.position.x = 0 - (boardSize.x / 2);
	planet.position.y = boardSize.z / 2;
	planet.position.z = 0;
	planet.color = 0xff8800;
	planet.ambient = 0x404040;
	planet.create();
	mars = planet.getObject();
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
				randomHeight = Math.random()*16;
			}
			else {
				randomHeight = 2;
			}
			tile.size.y = randomHeight;
			tile.position.y += (boardSize.y + randomHeight) * 2;
			tile.position.y = 1 + (boardSize.y / 2);
			tile.create();
			tiles[count] = tile.getObject();
			tiles[count].callback = function() { showBuildmenu(this); }
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
		skyBox.rotation.y += 0.00005;
		timer = Date.now() * 0.001;
		floor.position.y = Math.sin( timer ) * 16;
		for (i = 0; i < tiles.length; i++) {
			tiles[i].position.y = 1 + ((boardSize.y / 2) + (Math.sin(timer) * 16));
			if (tiles[i].selected != undefined && tiles[i].selected == true) {
				tiles[i].position.y += 10;
				tiles[i].rotation.y += 0.005;
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
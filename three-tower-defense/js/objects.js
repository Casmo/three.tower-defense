/**
 * @param Object buildingMaterial
 * Default THREE material for the buildings.
 */
var buildingMaterial = new Array();
buildingMaterial[0] = new THREE.MeshBasicMaterial({color: 0xff9900});
buildingMaterial[1] = new THREE.MeshBasicMaterial({color: 0x99ff00});
buildingMaterial[2] = new THREE.MeshBasicMaterial({color: 0x00ff99});
/**
 * @param array buildings
 * Available buildings to build
 */
var buildings = new Array();
// triangle
buildings[0] = new Object();
buildings[0].html = '<img src="images/towers/001.png" class="building" onclick="build(0);" />';
buildings[0].mesh = function() {
	return new THREE.Mesh(
		new THREE.CylinderGeometry(0, (tileSize/2), tileSize, 3, 1),
		buildingMaterial[0]
	);
}
buildings[0].stats = new Object();
buildings[0].stats.speed = 10;
buildings[0].stats.damage = 2;
buildings[0].stats.range = 1;
buildings[0].projectile = function() {
	return new THREE.Mesh(
		new THREE.SphereGeometry((tileSize/10), 16, 16),
		buildingMaterial[0]
	);
}
// circle
buildings[1] = new Object();
buildings[1].html = '<img src="images/towers/002.png" class="building" onclick="build(1);" />';
buildings[1].mesh = function() {
	return new THREE.Mesh(
		new THREE.SphereGeometry((tileSize/2), 16, 16),
		buildingMaterial[1]
	);
}
buildings[1].stats = new Object();
buildings[1].stats.speed = 20;
buildings[1].stats.damage = 1;
buildings[1].stats.range = 1;
buildings[1].projectile = function() {
	return new THREE.Mesh(
		new THREE.SphereGeometry((tileSize/10), 16, 16),
		buildingMaterial[1]
	);
}
// square
buildings[2] = new Object();
buildings[2].html = '<img src="images/towers/003.png" class="building" onclick="build(2);" />';
buildings[2].mesh = function() {
	return new THREE.Mesh(
		new THREE.CubeGeometry(tileSize-16, tileSize, tileSize-16),
		buildingMaterial[2]
	);
}
buildings[2].stats = new Object();
buildings[2].stats.speed = 50;
buildings[2].stats.damage = 5;
buildings[2].stats.range = 2;
buildings[2].projectile = function() {
	return new THREE.Mesh(
		new THREE.SphereGeometry((tileSize/10), 16, 16),
		buildingMaterial[2]
	);
}

/**
 * Object to create planets and tiles in the THREE Framework
 * @param Object t THREE object
 */
var Planet = function(t) {
	
	var object;
	this.texture = 'images/planet-moon.jpg';
	this.size = new Object();
	this.size.x = 32;
	this.size.y = 32;
	this.size.z = 32;
	this.position = new Object();
	this.position.x = 10;
	this.position.y = 50;
	this.position.z = 0;
	this.color = '';
	this.ambient = '';
	
	/**
	 * Creates the mesh for the planet
	 */
	this.create = function() {
		texture = new t.ImageUtils.loadTexture(this.texture);
		material = new t.MeshLambertMaterial (
			{
				map: texture,
				color: this.color,
				ambient: this.ambient
			}
		);
		geometry = new t.SphereGeometry(this.size.x, this.size.y, this.size.z);
		object = new t.Mesh(geometry, material);
		object.position.set(this.position.x, this.position.y, this.position.z);
	}
	
	/**
	 * Add the mesh to the scene
	 * @param the scene object
	 */
	this.getObject = function() {
		return object;
	}
	
	return this;
}

/**
 * Tile object that is used to build towers or traps.
 * @todo create path for enemies
 */
var Tile = function(t) {
	
	var object;
	this.texture = 'images/grass-dark.jpg';
	this.size = new Object();
	this.size.x = 64;
	this.size.y = 8;
	this.size.z = 64;
	this.position = new Object();
	this.position.x = 0;
	this.position.y = 0;
	this.position.z = 0;
	this.selected = false;
	
	/**
	 * Creates the mesh for the tile
	 */
	this.create = function() {
		texture = new t.ImageUtils.loadTexture(this.texture);
		material = new t.MeshLambertMaterial (
			{
				map: texture
			}
		);
		geometry = new t.CubeGeometry(this.size.x, this.size.y, this.size.z);
		object = new t.Mesh(geometry, material);
		object.position.set(this.position.x, this.position.y, this.position.z);
	}
	
	/**
	 * Add the mesh to the scene
	 * @param the scene object
	 */
	this.getObject = function() {
		return object;
	}
	
	return this;
}
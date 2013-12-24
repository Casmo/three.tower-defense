/**
 * @param Object buildingMaterial
 * Default THREE material for the buildings.
 */
var buildingMaterial = new THREE.MeshBasicMaterial({color: 0xff9900});
var buildings = new Array();
// triangle
buildings[0] = new Object();
buildings[0].html = '<img src="images/towers/001.png" class="building" />';
//buildings[0].shape = new THREE.CubeGeometry(tileSize, tileSize, tileSize);
// circle
buildings[1] = new Object();
buildings[1].html = '<img src="images/towers/002.png" class="building" />';
// square
buildings[2] = new Object();
buildings[2].html = '<img src="images/towers/003.png" class="building" />';

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
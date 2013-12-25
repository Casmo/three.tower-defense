/**
 * Class to manage monsters
 */
var Monster = function(t) {
	
	var object;
	this.texture = 'images/monster-001.jpg';
	this.hp = 10;
	this.speed = 10;
	this.size = new Object();
	this.size.x = 32;
	this.size.y = 32;
	this.size.z = 32;
	this.position = new Object();
	this.position.x = 10;
	this.position.y = 50;
	this.position.z = 0;
	
	// Store the end tile for this monster
	this.end = new Object();
	this.end.x = this.position.x + 512;
	this.end.y = this.position.y;
	
	/**
	 * Creates the mesh for the planet
	 */
	this.create = function() {
		texture = new t.ImageUtils.loadTexture(this.texture);
		material = new t.MeshLambertMaterial (
			{
				map: texture
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
	
	this.move = function() {
		
	}
	
	return this;
}
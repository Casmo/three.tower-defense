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
	this.currentStep = new Object();
	this.nextStep = new Object();
	this.end = new Object();
	
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
		this.setNodes();
	}
	
	/**
	 * Set the X,Y nodes for start and end for this monster
	 */
	this.setNodes = function() {
		if (this.end.x == undefined) {
			this.end.x = (((this.position.x - 1 - (tileSize/2)) + (boardSize.x*1.5)) / tileSize) - 1;
			this.end.y = ((this.position.z-1) / tileSize) + 1.5;
		}
		this.currentStep.x = 0;
		this.currentStep.y = Math.round(this.position.z / tileSize) + 1; // use .z because this is the vertical tiles
		// calculate next tile/step with a*
		Graph.nodes = nodes;
		start = nodes[this.currentStep.x][this.currentStep.y];
		end = nodes[this.end.x][this.end.y];
		result = astar.search(Graph.nodes, start, end);
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
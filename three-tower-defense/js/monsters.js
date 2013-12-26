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
		this.currentStep.x = 0;
		this.currentStep.y = calculateY(this.position.z);
		this.setNodes();
	}
	
	/**
	 * Set the X,Y nodes for start and end for this monster
	 */
	this.setNodes = function() {
		if (this.nextStep.x != undefined) {
			this.currentStep.x = this.nextStep.x;
			this.currentStep.y = this.nextStep.y;
		}
		if (this.end.x == undefined) {
			this.end.x = calculateX((boardSize.x/2));
			this.end.y = calculateY(this.position.z);
		}
		// calculate next tile/step with a*
		Graph.nodes = nodes;
		start = nodes[this.currentStep.x][this.currentStep.y];
		end = nodes[this.end.x][this.end.y];
		result = astar.search(Graph.nodes, start, end);
		if (result != '') {
			this.nextStep.x = result[0].x;
			this.nextStep.y = result[0].y;
		}
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
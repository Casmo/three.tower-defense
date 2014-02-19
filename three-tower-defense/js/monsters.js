/**
 * Class to manage monsters
 */
var Monster = function(t, type) {
	
	this.object;
	this.texture = 'files/models/enemy01.jpg';
	this.stats = new Object();
	this.stats.hp = 15;
	this.stats.hp_100 = 15;
	this.stats.speed = 0.125;
	this.stats.currency = 1;
	this.size = new Object();
	this.size.x = tileSize / 6;
	this.size.y = tileSize * 2;
	this.size.z = tileSize * 2;
	this.position = new Object();
	this.position.x = 10;
	this.position.y = 4.25;
	this.position.z = 0;
	this.scale = 0.6;

	if (typeof type != 'undefined') {
		switch (type) {
			case 2:
			this.texture = 'files/models/enemy02.jpg';
			this.scale = 0.7;
			break;
			case 3:
			this.texture = 'files/models/enemy03.jpg';
			this.scale = 0.8;
			break;
			case 4:
			this.texture = 'files/models/enemy04.jpg';
			this.scale = 0.9;
			break;
			case 5:
			this.texture = 'files/models/enemy05.jpg';
			this.scale = 1;
			break;
		}
	}
	
	// Store the end tile for this monster
	this.currentStep = new Object();
	this.nextStep = new Object();
	this.end = new Object();
	
	/**
	 * Creates the mesh for the monster
	 */
	this.create = function() {
		texture = new t.ImageUtils.loadTexture(this.texture);
		material = new t.MeshLambertMaterial (
			{
				map: texture
			}
		);
		geometry = new t.SphereGeometry(this.size.x, this.size.y, this.size.z);

		var refObject = window.ufo;
		this.object = new THREE.Mesh(refObject.geometry, material);
		
		//this.object = new t.Mesh(geometry, material);
		this.object.position.set(this.position.x, this.position.y, this.position.z);
		this.object.scale.x = this.scale;
		this.object.scale.y = this.scale;
		this.object.scale.z = this.scale;
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
		return this.object;
	}
	
	return this;
}
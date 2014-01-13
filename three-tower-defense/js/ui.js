/**
 * UI functions for THREE Tower Defense
 */

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
	if (towers[tile.index] != undefined) {
		// Delete option
		buildmenu.innerHTML += '<img src="images/towers/destroy.png" class="building" id="buildingDestroy" />';
	}
	if (devMode == true) {
		buildmenu.innerHTML += tile.x;
		buildmenu.innerHTML += ', ';
		buildmenu.innerHTML += tile.y;
	}
	buildmenu.style.display = 'block';
	building0 = document.getElementById('building0');
	building1 = document.getElementById('building1');
	building2 = document.getElementById('building2');
	buildingDestroy = document.getElementById('buildingDestroy');
	building0.addEventListener('click', function() {
		build(0);
    });
	building0.addEventListener('mouseover', function() {
		showBuildingInfo(0);
    });
	building0.addEventListener('mouseout', function() {
		hideBuildingInfo();
    });
	building1.addEventListener('click', function() {
		build(1);
    });
	building1.addEventListener('mouseover', function() {
		showBuildingInfo(1);
    });
	building1.addEventListener('mouseout', function() {
		hideBuildingInfo();
    });
	building2.addEventListener('click', function() {
		build(2);
    });
	building2.addEventListener('mouseover', function() {
		showBuildingInfo(2);
    });
	building2.addEventListener('mouseout', function() {
		hideBuildingInfo();
    });
    if (buildingDestroy != undefined) {
		buildingDestroy.addEventListener('click', function() {
			destroyTower(tile.index);deselectTiles();hideBuildmenu();
	    });
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
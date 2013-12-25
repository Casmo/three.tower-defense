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
	buildmenu.style.display = 'block';
	buildmenu.innerHTML += tile.x;
	buildmenu.innerHTML += ', ';
	buildmenu.innerHTML += tile.y;
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
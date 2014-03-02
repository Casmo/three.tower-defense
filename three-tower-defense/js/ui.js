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
	building0.addEventListener('mousedown', function() {
		build(0);
    });
	building0.addEventListener('mouseover', function() {
		showBuildingInfo(0);
    });
	building0.addEventListener('mouseout', function() {
		hideBuildingInfo();
    });
	building1.addEventListener('mousedown', function() {
		build(1);
    });
	building1.addEventListener('mouseover', function() {
		showBuildingInfo(1);
    });
	building1.addEventListener('mouseout', function() {
		hideBuildingInfo();
    });
	building2.addEventListener('mousedown', function() {
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
			destroyTower(tile.index);hideBuildmenu();
			selectTile(tile);
			showBuildmenu(tile);
	    });
    }
}
buttonAbout = document.getElementById('button_about');
buttonAbout.addEventListener('click', function() {
	showHideAbout();
});

aboutInfo = document.getElementById('about_info');
aboutInfo.addEventListener('click', function() {
	showHideAbout();
});
buttonReset = document.getElementById('button_reset');
buttonReset.addEventListener('click', function() {
	newGame();
});
startButton = document.getElementById('spawn_waves');
startButton.addEventListener('click', function() {
	if (gameStarted == false) {
		startGame();
	}
});

function showHideAbout() {
	show = 'block';
	if (document.getElementById('about_info').style.display == 'block') {
		show = 'none';
	}
	document.getElementById('about_info').style.display = show;
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
		if (tiles[i].selected == true) {
			tiles[i].position.y = 0.1 + ((boardSize.y / 2) + (basePosY));
			tiles[i].rotation.z = 0;
			if (towers[i] != undefined) {
				// Active tower has to be on top of the selected tile as well (for updating)
				towers[i].position.y = tiles[i].position.y + towers[i].heightPos;
				towers[i].rotation.y = 0;
			}
		}
		tiles[i].selected = false;
	}
}

function showBuildingInfo(building) {
	style = '';
	if (buildings[building].costs > score.currency) {
		style = "color: red;";
	}
	infoHtml = 'Cost: <b style="'+ style +'">' + buildings[building].costs +'</b><br />';
	dps = Math.round(buildings[building].stats.damage / buildings[building].stats.speed * 1000);
	infoHtml += 'Damage: <b>' + buildings[building].stats.damage +'</b> ('+ dps +' dps)<br />';
	infoHtml += 'Speed: <b>' + (buildings[building].stats.speed/1000) +' sec.</b><br />';
	infoHtml += 'Range: <b>' + buildings[building].stats.range +'</b>';
	document.getElementById('info-box').style.display = 'block';
	document.getElementById('info-box').innerHTML = infoHtml;
	document.getElementById('info-box').style.display = 'block';
	
}
function hideBuildingInfo() {
	document.getElementById('info-box').style.display = 'none';
	document.getElementById('info-box').innerHTML = '';
}
/**
 * @param object boardSize
 * Holds the default values of the (game)board size. Each side must be an multiple of
 * 2.
 */
var boardSize = new Object();
boardSize.x = 104; // Width, must be multiple of 2
boardSize.y = 8; // Height
boardSize.z = 72; // Depth, must be multiple of 2

/**
 * @param int tileSize
 * The x and y size of a tile. Must be a multiple of 2. Also used for buildings.
 */
var tileSize = 8;

/**
 * @param string detailLevel
 * Set the detail of the level. Options are 'low', 'medium', 'high'.
 * Default value is low.
 */
var detailLevel = 'high'; // Detail of the level 'low', 'medium', 'high'

/**
 * @param boolean devMode
 * Display additional information when in development.
 */
var devMode = false;
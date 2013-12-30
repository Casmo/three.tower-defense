/**
 * @param object boardSize
 * Holds the default values of the (game)board size. Each side must be an multiple of
 * 2.
 */
var boardSize = new Object();
boardSize.x = 832; // Width, must be multiple of 2
boardSize.y = 64; // Height
boardSize.z = 576; // Depth, must be multiple of 2

var gameWidth = 1024;
var gameHeight = 768;

/**
 * @param int tileSize
 * The x and y size of a tile. Must be a multiple of 2. Also used for buildings.
 */
var tileSize = 64;

/**
 * @param string detailLevel
 * Set the detail of the level. Options are 'low', 'medium', 'high'.
 * Default value is low.
 */
var detailLevel = 'medium'; // Detail of the level 'low', 'medium', 'high'

/**
 * @param boolean devMode
 * Display additional information when in development.
 */
var devMode = false;
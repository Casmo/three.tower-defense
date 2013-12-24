/**
 * @param object boardSize
 * Holds the default values of the (game)board size. Each side must be an multiple of
 * 2.
 */
var boardSize = new Object();
boardSize.x = 768; // Width
boardSize.y = 64; // Height
boardSize.z = 512; // Depth

/**
 * @param int tileSize
 * The x and y size of a tile. Must be a multiple of 2. Also used for buildings.
 */
var tileSize = 128;

/**
 * @param string detailLevel
 * Set the detail of the level. Options are 'lew', 'medium', 'high'.
 * Default value is low.
 */
var detailLevel = 'low'; // Detail of the level 'low', 'medium', 'high'
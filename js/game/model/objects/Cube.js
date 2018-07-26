import AbstractGridObject from './AbstractGridObject.js';

/**
 * Create a new cube on a board.
 * @class Cube
 */
export default class Cube extends AbstractGridObject {
	/**
	 * Creates a new Cube at the given coordinates in the given board.
	 * If the coordinates are not valid, the constructor throws an exception.
	 * This will replace any Cube already occupying the board.
	 * @param {Object} board The board the cube belongs to.
	 * @param {Array} coords The coordinates as an array.  These should be the
	 *                     same length as the board.
	 * @param {Number} color The color of the cube.
	 * @memberof Cube
	 */
	constructor(board, coords, color) {
		super(board, coords);
		this.color = color;
	}
}

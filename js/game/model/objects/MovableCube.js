import Cube from './Cube.js';

/**
 * Create a new cube on a board.
 * @class Cube
 */
export default class MovableCube extends Cube {
	constructor(board, coords, color) {
		super(board, coords, color);
	}

	/**
	 * 
	 * @param {Array} directions Numbers to keep adding until the box hits
	 */
	move(directions) {
		let newCoords = math.add(this.coords, directions);

		this.board.set(this.coords, null);
		if (!this.board.validCoords(newCoords)
			|| this.board.occupied(newCoords)) {
			this.board.set(this.coords, this);
			return;
		} else {
			this.coords = newCoords;
			this.move(directions);
		}
	}
}

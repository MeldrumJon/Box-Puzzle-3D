import NDimArray from '../lib/NDimArray.js';
import MovableCube from './objects/MovableCube.js';

/**
 * Creates a Board that contains moveable boxes.  Unoccupied spaces are null.
 * @class Board
 * @extends {NDimArray}
 */
export default class Board extends NDimArray {
	constructor(dimensions) {
		super(dimensions);
		this.fill(null);
		this.selector = null;
	}

	/**
	 * Checks to see if a box is at the coordinates.
	 * @param {any} coords The coordinates as an array: [x, y, z, a, b, ...]
	 * @return {Boolean}
	 * @memberof Board
	 */
	occupied(coords) {
		let obj = this.get(coords);
		if (obj !== null) {
			return true;
		}
		return false;
	}

	generate() {
		let dims1 = [0, 0, 0];
		let dims2 = [
			this.dims[0]-1,
			this.dims[1]-1,
			this.dims[2]-1,
		];
		this.set(dims1, new MovableCube(this, dims1, 0));
		this.set(dims2, new MovableCube(this, dims2, 3));
	}

	setSelector(selector) {
		this.selector = selector;
	}

	getSelector() {
		return this.selector;
	}
}

import Cube from "./objects/Cube.js";
import MovableCube from './objects/MovableCube.js'
import { CUBE_COLORS } from "../constants";

export default class CubeGenerator {
	/**
	 * Stores the probabilities of generating each type of cube with this cube generator.
	 * 
	 * The "probs" object is used to create the probabilities.  It contains a movable
	 * field, which stores an array of integers representing the probability of generating
	 * each color.  The immovable field contains an integer representing the probability 
	 * of generating an immovable cube.
	 * 
	 * The integers do not have to add up to 100.
	 * 
	 * @param {Object} probs Probabilities for each cube:
	 *     {
	 *         movable: {Array} // Probability of generating each color (see CUBE_COLORS constant)
	 *         immovable: {Number} // Probability of generating an immovable cube
	 * 		   none: {Number} // Probability of returning null
	 *     }
	 */
    constructor(probs) {
		this.total = 0;
		this.total += probs.none;
		this.none_cutoff = this.total;
		this.total = probs.immovable;
		this.immovable_cutoff = this.total;

		this.movable_cutoff = [];
		for (let i = 0; i < probs.movable.length; ++i) {
			this.total += probs.movable[i];
			this.movable_cutoff[i] = this.total;
		}
	}
	
	// TODO: comment!
	createCube(board, coords) {
		function randomInt_range(min, max) {
			return Math.floor(Math.random() * (max - min + 1) ) + min;
		}
		let x = randomInt_range(0, this.total-1);
		if (x < this.none_cutoff) {
			return null;
		}
		else if (x < this.immovable_cutoff) {
			return new Cube(board, coords, IMMOVABLE_COLOR);
		}
		else {
			let loopLength = Math.min(CUBE_COLORS.length, this.movable_cutoff.length);
			for (let i = 0; i < loopLength; ++i) {
				if (x < this.movable_cutoff[i]) {
					return new MovableCube(board, coords, CUBE_COLORS[i]);
				}
			}
		}
	}
}

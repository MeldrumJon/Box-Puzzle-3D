import NDimArray from '../lib/NDimArray.js';
import MovableCube from './objects/MovableCube.js';
import CubeGenerator from './CubeGenerator.js';

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
        let gen = new CubeGenerator({
            immovable: 3,
            movable: [1, 2, 3, 4, 5, 6],
        });

        let dims1 = [0, 0, 0];
        let dims2 = [
            this.dims[0] - 1,
            this.dims[1] - 1,
            this.dims[2] - 1,
        ];
        this.set(dims1, gen.createCube(this, dims1));
        this.set(dims2, gen.createCube(this, dims2));



    }

    setSelector(selector) {
        this.selector = selector;
    }

    getSelector() {
        return this.selector;
    }
}

class NDimArray {
    /**
     * Creates a new n-dimensional array
     * @param {Array} dimensions The dimensions of the array [x, y, z, a, ...]
     * @memberof NDimArray
     */
	constructor(dimensions) {
		this.dims = dimensions;
		this.scene = scene;
		this.fill(undefined); // initial array filled with undefined
	}

    /**
     * Fills the array with a specific value
     * @param {any} value Fill the array with this value.
     * @memberof NDimArray
     */
	fill(value) {
        /**
         * Private recursive function to help fill the array.
         * @param {any} array The array to fill.
         * @param {any} dims The dimensions of the array.
         */
		function fillRecurse(array, dims) {
			if (dims.length === 0) { // We've filled this branch with values
				return; // Base case. Do nothing
			}
			let curDim = dims[0];
            let newDims = dims.slice(1, dims.length);
            // Make an array with curDim values.
			for (let i = 0; i < curDim; ++i) {
                // If we're on the last dimension, fill the array with the value
                // Otherwise, we need to create another array.
				array[i] = (dims.length === 1) ? value : [];
				fillRecurse(array[i], newDims);
			}
        }
        this.array = []; // We need to begin with an empty array
		fillRecurse(this.array, this.dims); // Fill the array.
	}

    /**
     * Gets the value at a set of coordinates.
     * @param {Array} coords The coordinates as an array: [x, y, z, a, b, ...]
     * @return {Any} The value at the coordinates.
     * @memberof NDimArray
     */
	get(coords) {
		let array = this.array;
		let arrCoords = coords.slice(0, coords.length-1);
		let lastCoord = coords[coords.length-1];
		for (let i = 0; i < arrCoords.length; ++i) {
			array = array[coords[i]];
		}
		return array[lastCoord];
	}

    /**
     * Sets the value at a set of coordinates.
     * @param {any} coords The coordinates as an array: [x, y, z, a, b, ...]
     * @param {any} value The value to set the coordinates to.
     * @memberof NDimArray
     */
	set(coords, value) {
		let array = this.array;
		let arrCoords = coords.slice(0, coords.length-1);
		let lastCoord = coords[coords.length-1];
		for (let i = 0; i < arrCoords.length; ++i) {
			array = array[coords[i]];
		}
		array[lastCoord] = value;
    }

    /**
     * Checks if the coordinates fit within the dimensions of the array.
     * @param {any} coords The coordinates as an array: [x, y, z, a, b, ...]
     * @return {Boolean}
     * @memberof NDimArray
     */
    validCoords(coords) {
        // Make sure each array is the same size before moving on.
        if (coords.length !== this.dims.length) {
            return false;
        }
        // Checks that each coordinate is an integer and within the array
        // index range.
        for (let i = 0; i < coords.length; ++i) {
            if (0 <= coords[i] && coords[i] < this.dims[i]
             && Number.isInteger(coords[i])) {
                continue;
            }
            return false;
        }
        return true; // No problems, return true.
    }
}

export default NDimArray;

import AbstractGridObject from './AbstractGridObject.js';

export default class Selector extends AbstractGridObject {
    constructor(board, coords, color) {
        super(board, coords, color);
        this.selected = null;
    }

    move(directions) {
        let newCoords = math.add(this.coords, directions);
        if (!this.board.validCoords(newCoords)) {
            return;
        }
        this.coords = newCoords;
    }

    setPosition(coords) {
        if (!this.board.validCoords(coords)) {
            return;
        }
        this.coords = coords;
    }

    select() {
        if (this.selected !== null) { // deselect
            this.selected = null;
            return false;
        }
        this.selected = this.board.get(this.coords); // attempt to select
        if (this.selected !== null) {
            return true;
        }
        return false;
    }

    deselect() {
        this.selected = null;
        return true;
    }
}
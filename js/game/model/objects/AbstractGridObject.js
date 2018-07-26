export default class AbstractGridObject {
    constructor(board, coords) {
        if (new.target === AbstractGridObject) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }
        this.view = null;
        this.board = board;
        this.coords = coords; // must be after setting observer null
    }

    registerView(view) {
        this.view = view;
    }
}

export default class ModelCallbacks {
    constructor(onNewBoard=null, onNewCube=null, onNewSelector=null,
                onCubeMove=null, onSelectorMove=null) {
        this.newBoardCallback = onNewBoard;
		this.newCubeCallback = onNewCube;
		this.newSelectorCallback = onNewSelector;
        this.moveCubeCallback = onCubeMove;
        this.selectorMoveCallback = onSelectorMove;
    }

    onNewBoard(board) {
        if (this.newBoardCallback !== null) {
            this.newBoardCallback(board);
        }
    }

    onNewCube(cube) {
        if (this.newCubeCallback !== null) {
            this.newCubeCallback(cube);
        }
    }

    onNewSelector(selector) {
        if (this.newSelectorCallback !== null) {
            this.newSelectorCallback(selector);
        }
    }

    onCubeMove(cube) {
        if (this.moveCubeCallback !== null) {
            this.moveCubeCallback(cube);
        }
    }

    onSelectorMove(selector) {
        if (this.selectorMoveCallback !== null) {
            this.selectorMoveCallback(selector);
        }
    }
}

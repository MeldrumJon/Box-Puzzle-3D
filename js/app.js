import * as tests from './tests.js';
import BoardView from './game/view/BoardView.js';
import Board from './game/model/Board.js';
import Selector from './game/model/objects/Selector.js';
import Controller from './game/controller/Controller.js';

/**
 * Test all classes.
 */
function mainTest() {
    tests.testNDimArray();
    tests.testBoard();
    tests.testMovableCube();
    tests.testSelector();

    let board = new Board([2, 3, 4]);
    let selector = new Selector(board, [0, 0, 0], 0xffffff);
    board.setSelector(selector);
    board.generate();

    let scene = new BoardView(board, 'scene');

    let controller = new Controller(selector);
}
window.load=mainTest();

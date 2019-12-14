import Board from './Board.js';
import ThreeBoard from './ThreeBoard.js';
import ThreeSlidableBoard from './ThreeSlidableBoard.js';
import EventHelper from './EventHelper.js';

function main() {
    window.scrollTo(0,1);

    const puzzleEl = document.getElementById('puzzle');
    const solutionEl = document.getElementById('solution');

    let board = new Board([3, 4, 5]);
    board.randomize(10, [10, 5, 5, 5, 5, 5, 5, 50]);
    let solution = board.solutionize(456, 4, 5);

    var pz = new ThreeSlidableBoard(puzzleEl, board);
    var sl = new ThreeBoard(solutionEl, solution);
    pz.beginRenderLoop();
    sl.beginRenderLoop();

}

main();


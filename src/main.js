import Board from './Board.js';
import ThreeBoard from './ThreeBoard.js';

function main() {
    const puzzleEl = document.getElementById('puzzle');
    const solutionEl = document.getElementById('solution');

    let board = new Board([3, 4, 5]);
    board.randomize(123, [1, 1, 1, 1, 1, 1, 1, 1, 6]);
    let solution = board.solutionize(456, 4, 5);

    var pz = new ThreeBoard(puzzleEl, board);
    var sl = new ThreeBoard(solutionEl, solution);

}

main();


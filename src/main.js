import Board from './Board.js';
import ThreeBoard from './ThreeBoard.js';
import ThreeSlidableBoard from './ThreeSlidableBoard.js';

function main() {
    const puzzleEl = document.getElementById('puzzle');
    const solutionEl = document.getElementById('solution');

    let board = new Board([3, 4, 5]);
    board.randomize(123, [1, 1, 1, 1, 1, 1, 1, 1, 6]);
    let solution = board.solutionize(456, 4, 5);

    var pz = new ThreeSlidableBoard(puzzleEl, board);
    var sl = new ThreeBoard(solutionEl, solution);

    function movement(e) {
        if (e.key === 'q') { pz.smove([1, 0, 0]); }
        else if (e.key === 'w') { pz.smove([0, 1, 0]); }
        else if (e.key === 'e') { pz.smove([0, 0, 1]); }
        else if (e.key === 'a') { pz.smove([-1, 0, 0]); }
        else if (e.key === 's') { pz.smove([0, -1, 0]); }
        else if (e.key === 'd') { pz.smove([0, 0, -1]); }
        else if (e.key === ' ') { pz.tselect(); } 
    }
    document.addEventListener('keydown', movement);

}

main();


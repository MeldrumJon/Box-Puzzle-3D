import * as C from './const.js';
import Board from './Board.js';
import ThreeBoard from './ThreeBoard.js';
import ThreeSlidableBoard from './ThreeSlidableBoard.js';
import EventHelper from './EventHelper.js';

const puzzleEl = document.getElementById('puzzle');
const solutionEl = document.getElementById('solution');

const separationEl = document.getElementById('separation');
const fadeLayersEl = document.getElementById('fade_layers');
const undoEl = document.getElementById('undo');
const restartEl = document.getElementById('restart');
//const solveEl = document.getElementById('solve');

const puzzleBoard = new ThreeSlidableBoard(puzzleEl);
const solutionBoard = new ThreeBoard(solutionEl);

function generate() {
    let dimensions = [3, 4, 5];
    let seed1 = 10;
    let seed2 = 456;
    let difficulty = 5;

    let board = new Board(dimensions);
    board.randomize(seed1, C.PROBABILITIES);
    let solution = board.solutionize(seed2, difficulty, 100);

    puzzleBoard.setBoard(board);
    solutionBoard.setBoard(solution);

    let layers = puzzleBoard.totalLayers();
    fadeLayersEl.setAttribute('max', layers);
}

function finished() {
    puzzleBoard.clearBoard();
    solutionBoard.clearBoard();
}

function main() {
    fadeLayersEl.addEventListener('input', () => {
        let value = fadeLayersEl.value;
        puzzleBoard.fade_layers(value);
        solutionBoard.fade_layers(value);
    });
    separationEl.addEventListener('input', () => {
        let value = separationEl.value;
        puzzleBoard.separate(value);
        solutionBoard.separate(value);
    });
    undoEl.addEventListener('click', () => { puzzleBoard.undo(); } );
    restartEl.addEventListener('click', () => { puzzleBoard.restart(); } );
    puzzleBoard.beginRenderLoop();
    solutionBoard.beginRenderLoop();
    generate();
}

main();


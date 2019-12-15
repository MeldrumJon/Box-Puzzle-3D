import * as C from './const.js';
import Board from './Board.js';
import ThreeBoard from './ThreeBoard.js';
import ThreeSlidableBoard from './ThreeSlidableBoard.js';
import EventHelper from './EventHelper.js';

function strHash(str) {
    let hash = 0;
    if (str.length == 0) {
        return hash;
    }
    for (let i = 0, len = str.length; i < len; i++) {
        let char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = ~~(hash); // Convert to 32bit integer
    }
    return hash;
}

function main() {
    let board = null;
    let solution = null;

    const elBody = document.getElementById('box_pusher_3d');

    const elPuzzle = document.getElementById('puzzle');
    const elSolution = document.getElementById('solution');
    const elControls = document.getElementById('controls');
    const elControlsInner = document.getElementById('controls_inner');

    const elSeparation = document.getElementById('separation');
    const elFadeLayers = document.getElementById('fade_layers');
    const elUndo = document.getElementById('undo');
    const elRestart = document.getElementById('restart');

    const elPuzzleName = document.getElementById('puzzle_name');
    const elDimX = document.getElementById('dimx');
    const elDimY = document.getElementById('dimy');
    const elDimZ = document.getElementById('dimz');
    const elDifficulty = document.getElementById('difficulty');
    const elGenerate = document.getElementById('generate');
    
    const elCongratsBtn = document.getElementById('congrats_btn');

    let setControlsSize = function () {
    	if (elControlsInner.clientWidth > (window.innerWidth/2+1)) {
            elBody.classList.add('oversize');
            elPuzzle.style.bottom = elControls.clientHeight + 'px';
            elSolution.style.bottom = elControls.clientHeight + 'px';
    	}
    	else {
            elBody.classList.remove('oversize');
            elPuzzle.style.bottom = 0;
            elSolution.style.bottom = 0;
    	}
    }
    window.addEventListener('resize', setControlsSize, {passive: true});
    window.addEventListener('orientationchange', setControlsSize, {passive: true});
    setControlsSize(); // needs to happen before passing the elements to Threejs

    const threePuzzle = new ThreeSlidableBoard(elPuzzle);
    const threeSolution = new ThreeBoard(elSolution);

    function hideShade() {
        elBody.classList.remove('shade');
        elBody.classList.remove('generate');
        elBody.classList.remove('congrats');
    }

    function showShade(shadeName) {
        hideShade();
        elBody.classList.add('shade');
        elBody.classList.add(shadeName);
    }

    // Generate
    let init = function() {
        elPuzzleName.value = 'Puzzle ' + ~~(Math.random() * 999999);
        showShade('generate');
    }
    init();

    let validate = function () {
        let valid = true;
        let name = elPuzzleName.value;
        if (name === '') {
            elPuzzleName.classList.add('invalid');
            valid = false;
        }
        else {
            elPuzzleName.classList.remove('invalid');
        }
        let difficulty = parseInt(elDifficulty.value, 10);
        if (isNaN(difficulty) || difficulty < 1) {
            console.log(elDifficulty.value);
            elDifficulty.classList.add('invalid');
            valid = false;
        }
        else {
            elDifficulty.classList.remove('invalid');
        }
        const elDims = [elDimX, elDimY, elDimZ];
        let dims = new Array(3);
        for (let i = 0, len = elDims.length; i < len; ++i) {
            let dim = parseInt(elDims[i].value, 10);
            if (isNaN(dim) || dim < 1 || dim > 8) {
                elDims[i].classList.add('invalid');
                valid = false;
            }
            else {
                elDims[i].classList.remove('invalid');
            }
            dims[i] = dim;
        }
        if (dims[0] === 1 && dims[1] === 1 && dims[2] === 1) {
            valid = false;
            for (let i = 0, len = elDims.length; i < len; ++i) {
                elDims[i].classList.add('invalid');
            }
        }
        if (valid) {
            elGenerate.removeAttribute('disabled', '');
        }
        else {
            elGenerate.setAttribute('disabled', 'true');
        }
        return valid;
    };

    elPuzzleName.addEventListener('input', validate);
    elDimX.addEventListener('input', validate);
    elDimY.addEventListener('input', validate);
    elDimZ.addEventListener('input', validate);
    elDifficulty.addEventListener('input', validate);
    elPuzzleName.addEventListener('change', validate);
    elDimX.addEventListener('change', validate);
    elDimY.addEventListener('change', validate);
    elDimZ.addEventListener('change', validate);
    elDifficulty.addEventListener('change', validate);

    elGenerate.addEventListener('click', function generate() {
        let valid = validate();
        if (valid) {
            threePuzzle.clearBoard();
            threeSolution.clearBoard();

            let name = elPuzzleName.value;
            let dimensions = [
                parseInt(elDimX.value, 10),
                parseInt(elDimY.value, 10),
                parseInt(elDimZ.value, 10),
            ];
            let difficulty = parseInt(elDifficulty.value, 10);
            
            let str = elDimX.value + elDimY.value + elDimZ.value
                    + elPuzzleName.value + elDifficulty.value;
            let seed = strHash(str);

            board = new Board(dimensions);
            do {
                do {
                    board.randomize(seed, C.PROBABILITIES);
                    ++seed;
                } while (!board.solutionable());
                solution = board.solutionize(seed, difficulty, 100);
                ++seed;
            } while (solution.equals(board));

            threePuzzle.setBoard(board);
            threeSolution.setBoard(solution);

            let layers = threePuzzle.totalLayers();
            elFadeLayers.setAttribute('max', layers);

            hideShade();
        }
    });

    // Gameplay

    elFadeLayers.addEventListener('input', () => {
        let value = elFadeLayers.value;
        threePuzzle.fade_layers(value);
        threeSolution.fade_layers(value);
    });
    elSeparation.addEventListener('input', () => {
        let value = elSeparation.value;
        threePuzzle.separate(value);
        threeSolution.separate(value);
    });
    elUndo.addEventListener('click', () => { threePuzzle.undo(); } );
    elRestart.addEventListener('click', () => { threePuzzle.restart(); } );

    threePuzzle.setMoveCallback(function onMove() {
        if (!board || !solution) { return; }
        if (board.equals(solution)) {
            showShade('congrats');
        }
    });
    
    // Congrats: you've won!
    elCongratsBtn.addEventListener('click', init);

    threePuzzle.beginRenderLoop();
    threeSolution.beginRenderLoop();
}

main();


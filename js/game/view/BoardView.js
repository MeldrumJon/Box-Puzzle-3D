import ThreeFacade from './three/ThreeFacade.js';
import CubeView from './CubeView.js';
import SelectorView from './SelectorView.js';
import * as C from '../constants.js';

export default class BoardView {
    constructor(board, id, enAntiAliasing = true) {
        this.threeFacade = new ThreeFacade(id, enAntiAliasing);
        this.threeFacade.beginAnimate();
        this.dims = board.dims;
        this.setupBoard(board);
    }
    get lengths() {
        return math.multiply(this.dims, C.CUBE_W);
    }
    get center() {
        return math.divide(this.lengths, 2);
    }

    setupBoard(board) {
        this.board = board;

        let cameraPosition = math.multiply(this.lengths, C.CAMERA_POS_SCALAR);
        this.threeFacade.moveCameraTo(cameraPosition);
        this.threeFacade.setTarget(this.center);

        let dirLightPos = math.multiply(this.lengths, C.DIR_LIGHT_POS_SCALAR);
        this.threeFacade.addLight(dirLightPos);

        this.threeFacade.add3DGrid(C.AXIS_POSITION, this.dims, this.lengths);

        let selector = this.board.selector;
        if (selector !== null) {
            let selectorView = new SelectorView(
                this.threeFacade, this.board.selector
            );
        }

        function each(cube, index, matrix) {
            if (cube !== null) {
                let cubeView = new CubeView(this.threeFacade, cube);
            }
        }
        math.forEach(board.array, each.bind(this));
    }
}
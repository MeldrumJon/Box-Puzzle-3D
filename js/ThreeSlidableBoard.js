import * as C from './const.js';
import * as AMath from './arrayMath.js';
import ThreeBoard from './ThreeBoard.js';
import EventHelper from './EventHelper.js';

const loader = new THREE.TextureLoader();
const SIDE_SPACE = -0.01;
const SIDE_GEOMETRY = new THREE.PlaneBufferGeometry(
        C.CUBE_SIZE-SIDE_SPACE, C.CUBE_SIZE-SIDE_SPACE
);
SIDE_GEOMETRY.applyMatrix(
        new THREE.Matrix4().makeTranslation(0, 0, -C.CUBE_SIZE/2+SIDE_SPACE)
);
const SIDE_HOVER_MAP = loader.load('resources/side_select.png');
const SIDE_SELECTOR_MAP = loader.load('resources/select.png'); // relative to index.html
const SIDE_MATERIAL = new THREE.MeshBasicMaterial({
    map: SIDE_SELECTOR_MAP,
    transparent:true,
    alphaTest: 0.4,
    side: THREE.DoubleSide
});
const SIDE_X_FORWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL.clone()
);
SIDE_X_FORWARD.rotation.y = -90*(Math.PI/180);
const SIDE_Y_FORWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL.clone()
);
const SIDE_Z_FORWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL.clone()
);
SIDE_Z_FORWARD.rotation.x = -90*(Math.PI/180);

const SIDE_X_BACKWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL.clone()
);
SIDE_X_BACKWARD.rotation.y = 90*(Math.PI/180);
const SIDE_Y_BACKWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL.clone()
);
SIDE_Y_BACKWARD.rotation.y = Math.PI;
const SIDE_Z_BACKWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL.clone()
);
SIDE_Z_BACKWARD.rotation.x = 90*(Math.PI/180);


const FPS = 60;
const ANIMATION_LEN = 0.1;
const ANIMATION_STEP = C.CUBE_SIZE/(FPS*ANIMATION_LEN);

export default class ThreeSlidableBoard extends ThreeBoard {
    _client2vec(client_x, client_y) {
        let rect = this.el.getBoundingClientRect();
        let width = this.el.clientWidth;
        let height = this.el.clientHeight;
        return new THREE.Vector2(
                ((client_x - rect.left)/width) * 2 - 1,
                -((client_y - rect.top)/height) * 2 + 1
        );
    }

    _animate(obj3d, position, callback) {
        this.busy = true;

        let diff = position.clone().sub(obj3d.position);

        let iterations = 0;
        let total_steps = ~~(diff.length() / (ANIMATION_STEP * this.separation));
        let step_vector = diff.divideScalar(total_steps);
        let animate = function() {
            if (iterations >= total_steps) {
                obj3d.position.copy(position);
                this.needsRender = true;
                this.busy = false;
                if (callback) { window.setTimeout(callback); }
            }
            else {
                obj3d.position.add(step_vector);
                this.needsRender = true;
                ++iterations;
                window.requestAnimationFrame(animate);
            }
        }.bind(this);
        animate();
    }

    constructor(el) {
        super(el);

        this.selector = new THREE.Group();
        let sideXForward = SIDE_X_FORWARD.clone();
        let sideYForward = SIDE_Y_FORWARD.clone();
        let sideZForward = SIDE_Z_FORWARD.clone();
        let sideXBackward = SIDE_X_BACKWARD.clone();
        let sideYBackward = SIDE_Y_BACKWARD.clone();
        let sideZBackward = SIDE_Z_BACKWARD.clone();
        sideXForward.board_dir = [1, 0, 0];
        sideYForward.board_dir = [0, 1, 0];
        sideZForward.board_dir = [0, 0, 1];
        sideXBackward.board_dir = [-1, 0, 0];
        sideYBackward.board_dir = [0, -1, 0];
        sideZBackward.board_dir = [0, 0, -1];
        this.selector.add(sideXForward);
        this.selector.add(sideYForward);
        this.selector.add(sideZForward);
        this.selector.add(sideXBackward);
        this.selector.add(sideYBackward);
        this.selector.add(sideZBackward);
        this.selector.visible = false;
        this.scene.add(this.selector);

        this.selected_cube = null;
        this.selected_side = null;

        this.raycaster = new THREE.Raycaster()
        this.busy = false;

        this.evtHelper = new EventHelper(this.el, {
            click: this.mouse_click.bind(this),
            move: this.mouse_hover.bind(this),
            tap: this.tap.bind(this)
        });
        this.hovering = false;
        this.hoveringX = 0;
        this.hoveringY = 0;

        this.moveCallback = null;
    }

    beginRenderLoop() {
        let loop = function () {
            if (this.hovering) {
                if (this.selected_cube) {
                    let side = this.raycast_side(this.hoveringX,
                            this.hoveringY
                    );
                    if (side) {
                        this.selectSide(side);
                    }
                    else {
                        this.deselectSide();
                    }
                }
                this.hovering = false;
            }
            if (this.needsRender) {
                this.renderer.render(this.scene, this.camera);
                this.needsRender = false;
            }
            requestAnimationFrame(loop);
        }.bind(this);
        requestAnimationFrame(loop); // begin
    }

    setBoard(board) {
        super.setBoard(board);
        this.moves = [];
    }

    clearBoard() {
        super.clearBoard();
        this.selector.visible = false;
        this.selected_cube = null;
        this.needsRender = true;
    }

    setMoveCallback(callback) {
        this.moveCallback = callback;
    }

    separate(factor) {
        super.separate(factor);
        if (this.selected_cube) {
            this.selector.position.copy(
                    this._b2T(this.selected_cube.board_coord)
            );
        }
        this.needsRender = true;
    }

    slide(dir, callback=false) {
        if (!this.selected_cube) { return false; } // Cannot slide nothing
        let oc = this.selected_cube.board_coord;
        let nc = this.board.slide(oc, dir);
        if (nc === null) { return false; }
        this.cubes.set(oc, null);
        this.cubes.set(nc, this.selected_cube);
        this.selected_cube.board_coord = nc;
        this._animate(this.selected_cube, this._b2T(nc));
        this._animate(this.selector, this._b2T(nc), this.moveCallback);
        this.moves.push({
            start: oc,
            end: nc
        });
        return true;
    }

    select(cube) {
        if (!cube || cube.cube_type === 0) { return false; }
        this.selector.position.copy(this._b2T(cube.board_coord));
        this.selector.visible = true;
        this.selected_cube = cube;
        this.fade_others(cube.board_coord); 
        this.needsRender = true;
        return true;
    }

    deselect() {
        this.selector.visible = false;
        this.selected_cube = null;
        this.fade_layers(this.fadedLayers);
        this.needsRender = true;
        return true;
    }

    selectSide(side) {
        if (this.selected_side === side) { return; } // already selected
        if (this.selected_side) { // clear current selection
            this.selected_side.material.map = SIDE_SELECTOR_MAP;
        }
        side.material.map = SIDE_HOVER_MAP;
        this.selected_side = side;
        this.needsRender = true;
    }

    deselectSide() {
        if (!this.selected_side) { return; }
        this.selected_side.material.map = SIDE_SELECTOR_MAP;
        this.selected_side = null;
        this.needsRender = true;
    }

    mouse_hover(x, y) {
        this.hovering = true;
        this.hoveringX = x;
        this.hoveringY = y;
    }

    mouse_click(x, y) {
        if (this.busy) { return; } // Do nothing while animating
        if (this.selected_cube) {
            if (this.selected_side) {
                this.slide(this.selected_side.board_dir, true);
                this.deselectSide();
            }
            else {
                this.deselect();
            }
        }
        else {
            let cube = this.raycast_cube(x, y);
            if (cube) {
                this.select(cube);
                this.selector.updateMatrixWorld(); // Make sure raycaster catches the object
                this.mouse_hover(x, y); // highlight any hovering side
            }
        }
    }

    tap(x, y) {
        if (this.busy) { return; } // Do nothing while animating
        if (this.selected_cube) {
            let side = this.raycast_side(x, y);
            if (side) {
                if (side === this.selected_side) {
                    this.slide(this.selected_side.board_dir, true);
                    this.deselectSide();
                }
                else {
                    this.selectSide(side);
                }
            }
            else {
                this.deselect();
            }
        }
        else {
            let cube = this.raycast_cube(x, y);
            if (cube) {
                this.select(cube);
                this.selector.updateMatrixWorld(); // Make sure raycaster catches the object
            }
        }

    }

    raycast_side(client_x, client_y) {
        let vec2 = this._client2vec(client_x, client_y);
        this.raycaster.setFromCamera(vec2, this.camera);
        let intersections = this.raycaster.intersectObjects(this.selector.children);
        if (intersections[0]) {
            let side = intersections[0].object;
            return side;
        }
        else {
            return null;
        }
    }

    raycast_cube(client_x, client_y) {
        let vec2 = this._client2vec(client_x, client_y);
        this.raycaster.setFromCamera(vec2, this.camera);
        let intersections = this.raycaster.intersectObjects(this.cube_grp.children);
        for (let i = 0, len = intersections.length; i < len; ++i) {
            let cube = intersections[i].object;
            if (cube.material.opacity < 1) { continue; }
            return cube;
        }
        return null;
    }

    undo() {
        this.deselect();
        const len = this.moves.length;
        if (len <= 0) { return; }
        let move = this.moves.pop();
        let cube = this.cubes.get(move.end);
        let type = this.board.get(move.end);
        this.cubes.set(move.end, null);
        this.cubes.set(move.start, cube);
        this.board.set(move.end, -1);
        this.board.set(move.start, type);

        cube.board_coord = move.start;
        cube.position.copy(this._b2T(move.start));
        this.needsRender = true;
    }

    restart() {
        while (this.moves.length > 0) {
            this.undo();
        }
    }

    solve() {
        console.log("Solve called");
    }
}

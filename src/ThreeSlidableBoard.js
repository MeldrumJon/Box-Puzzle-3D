import * as C from './const.js';
import * as AMath from './ArrayMath.js';
import ThreeBoard from './ThreeBoard.js';

const loader = new THREE.TextureLoader();
const SELECTOR_GEOMETRY = //new THREE.EdgesGeometry(
    new THREE.BoxBufferGeometry(
        C.CUBE_SIZE, C.CUBE_SIZE, C.CUBE_SIZE
    );
//);
const SELECTOR_MATERIAL = new THREE.MeshBasicMaterial({
    map: loader.load('textures/select.png'), // Relative to index.html
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
});

const SIDE_SPACE = -0.01;
const SIDE_GEOMETRY = new THREE.PlaneBufferGeometry(
        C.CUBE_SIZE-SIDE_SPACE, C.CUBE_SIZE-SIDE_SPACE
);
SIDE_GEOMETRY.applyMatrix(
        new THREE.Matrix4().makeTranslation(0, 0, -C.CUBE_SIZE/2+SIDE_SPACE)
);
// Relative to index.html
const SIDE_HOVER_MAP = loader.load('textures/side_select.png');
const SIDE_SELECTOR_MAP = loader.load('textures/select.png');
const SIDE_MATERIAL = new THREE.MeshBasicMaterial({
    map: SIDE_SELECTOR_MAP,
    transparent: true,
    opacity: 1,
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
    constructor(el, board) {
        super(el, board);

        const [x, y, z] = this.board.dims;

        this.selected = null;

        this.selector_grp = new THREE.Group();
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
        this.selector_grp.add(sideXForward);
        this.selector_grp.add(sideYForward);
        this.selector_grp.add(sideZForward);
        this.selector_grp.add(sideXBackward);
        this.selector_grp.add(sideYBackward);
        this.selector_grp.add(sideZBackward);
        this.selector_grp.visible = false;
        this.scene.add(this.selector_grp);

        this.hover_side = null;

        this.busy = false;

        this.el.addEventListener('mousedown', this.mdown.bind(this));
        this.el.addEventListener('mousemove', this.mmove.bind(this));
        this.el.addEventListener('mouseup', this.mup.bind(this));
        this.mouseDown = false;
        this.mouseStart = {
            x: 0,
            y: 0
        }
        this.mouseDrag = false;
    }

    separate(factor) {
        super.separate(factor);
        this.selector_grp.position.copy(
                this._b2T(this.selector_grp.board_coord)
        );
    }

    _animate(obj3d, position) {
        this.busy = true;

        let diff = position.clone().sub(obj3d.position);

        let iterations = 0;
        let total_steps = ~~(diff.length() / (ANIMATION_STEP * this.separation));
        let step_vector = diff.divideScalar(total_steps);
        let animate = function() {
            if (iterations >= total_steps) {
                obj3d.position.copy(position);
                this.busy = false;
            }
            else {
                obj3d.position.add(step_vector);
                ++iterations;
                window.requestAnimationFrame(animate);
            }
        }.bind(this);
        window.requestAnimationFrame(animate);
    }

    _client2scene(x, y) {
        let width = this.el.clientWidth;
        let height = this.el.clientHeight;
        return {
            x: (x / width) * 2 - 1,
            y: - (y / height) * 2 + 1
        }
    }

    raycast_selector(obj_xy) {
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(obj_xy, this.camera);
        let intersections = raycaster.intersectObjects(this.selector_grp.children);
        if (intersections[0]) {
            let side = intersections[0].object;
            return side;
        }
        else {
            return null;
        }
    }

    raycast_cube(obj_xy) {
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(obj_xy, this.camera);
        let intersections = raycaster.intersectObjects(this.cube_grp.children);
        if (intersections[0]) {
            let cube = intersections[0].object;
            return cube;
        }
        else {
            return null;
        }
    }

    slide(dir) {
        if (!this.selected) { return false; } // Cannot slide nothing
        let oc = this.selected.board_coord;
        let nc = this.board.slide(oc, dir);
        if (nc === null) { return false; }
        this.cubes.set(oc, null);
        this.cubes.set(nc, this.selected);
        this.selected.board_coord = nc;
        this._animate(this.selected, this._b2T(nc));
        this._animate(this.selector_grp, this._b2T(nc));
        return true;
    }

    select(cube) {
        if (!cube || cube.cube_type === 0) { return false; }
        this.selector_grp.position.copy(this._b2T(cube.board_coord));
        this.selector_grp.visible = true;
        this.selected = cube;
        this.fade_others(cube.board_coord);
        return true;
    }

    deselect() {
        this.selector_grp.visible = false;
        this.selected = null;
        this.fade_none();
        return true;
    }

    _selectorHover(obj_xy) {
        if (!this.selected) { return false; }
        let side = this.raycast_selector(obj_xy);
        if (this.hover_side === side) { return true; }
        if (this.hover_side) {
            this.hover_side.material.map = SIDE_SELECTOR_MAP;
        }
        if (side) {
            side.material.map = SIDE_HOVER_MAP;
            this.hover_side = side;
            return true;
        }
        else {
            this.hover_side = null;
            return false;
        }
    }

    _selectorUnhover() {
        this.hover_side.material.map = SIDE_SELECTOR_MAP;
        this.hover_side = null;
    }

    mdown(e) {
        this.mouseDown = true;
        this.mouseDrag = false;
        this.mouseStart = {
            x: e.clientX,
            y: e.clientY
        }
    }
    mmove(e) {
        if (this.mouseDown && !this.mouseDrag
                && (Math.abs(this.mouseStart.x - e.clientX) > 5
                || Math.abs(this.mouseStart.y - e.clientY) > 5)) {
            this.mouseDrag = true;
        }
        // Hovering/Cursor
        if (this.busy) { return; } // No hovering while animating
        if (!this.mouseDown) {
            if (this.selected) {
                let obj_xy = this._client2scene(e.clientX, e.clientY);
                this._selectorHover(obj_xy);
            }
        }
    }
    mup(e) {
        this.mouseDown = false;
        if (this.mouseDrag) { return; } // Don't do anything with drag

        // Click handling
        if (this.busy) { return; }
        let obj_xy = this._client2scene(e.clientX, e.clientY);
        if (this.selected) {
            if (this.hover_side) {
                this.slide(this.hover_side.board_dir);
                this._selectorUnhover();
            }
            else {
                this.deselect();
            }
        }
        else {
            let cube = this.raycast_cube(obj_xy);
            if (cube) {
                this.select(cube);
                // Raycaster needs selector to be visible; wait until next frame
                let updateHover = function() {
                    this._selectorHover(obj_xy);
                }.bind(this);
                window.requestAnimationFrame(updateHover);
            }
            else {
                this.deselect();
            }
        }
    }

}

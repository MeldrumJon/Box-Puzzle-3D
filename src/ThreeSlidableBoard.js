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
const SIDE_MATERIAL = new THREE.MeshBasicMaterial({
    map: loader.load('textures/side_select.png'), // Relative to index.html
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
});
const SIDE_X_FORWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL
);
SIDE_X_FORWARD.rotation.y = -90*(Math.PI/180);
const SIDE_Y_FORWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL
);
const SIDE_Z_FORWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL
);
SIDE_Z_FORWARD.rotation.x = -90*(Math.PI/180);

const SIDE_X_BACKWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL
);
SIDE_X_BACKWARD.rotation.y = 90*(Math.PI/180);
const SIDE_Y_BACKWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL
);
SIDE_Y_BACKWARD.rotation.y = Math.PI;
const SIDE_Z_BACKWARD = new THREE.Mesh(
        SIDE_GEOMETRY, SIDE_MATERIAL
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

        this.raycaster = new THREE.Raycaster();
        this.el.addEventListener('mousedown', this.mdown.bind(this));
        this.el.addEventListener('mousemove', this.mmove.bind(this));
        this.el.addEventListener('mouseup', this.mup.bind(this));
        this.isDragging = false;

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

        this._setBoardProps(this.selector_grp, [x-1, y-1, z-1]);
        this.scene.add(this.selector_grp);

        this.separate(4);
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

    slide(dir) {
        if (this.busy) { return false; }
        if (this.selected === null) { return false; } // Cannot slide nothing
        let oc = this.selector.board_coord;
        let nc = this.board.slide(oc, dir);
        if (nc === null) { return false; }
        this.cubes.set(oc, null);
        this.cubes.set(nc, this.selected);
        this.selector.board_coord = nc;
        this._animate(this.selector, this._b2T(nc));
        //this.selector.position.copy(this._b2T(nc));
        this.selected.board_coord = nc;
        this._animate(this.selected, this._b2T(nc));
        //this.selected.position.copy(this._b2T(nc));
        return true;
    }

    move(dir) {
        if (this.busy) { return false; }
        if (this.selected !== null) { return false; } // Cannot move with something selected
        let c = AMath.add(this.selector.board_coord, dir);
        if (!this.board._valid(c)) { return false; } // Cannot move to invalid coordinate
        this.selector.board_coord = c;
        this._animate(this.selector, this._b2T(c));
        //this.selector.position.copy(this._b2T(c));
        return true;
    }

    move_to(c, callback) {
        if (this.busy) { return false; }
        if (!this.board._valid(c)) { return false; }
        this.selector.board_coord = c;
        this._animate(this.selector, this._b2T(c));
        //this.selector.position.copy(this._b2T(c));
        return true;
    }

    smove(dir, callback) {
        if (this.selected) {
            this.slide(dir, callback);
        }
        else {
            this.move(dir, callback);
        }
    }

    select() {
        if (this.busy) { return false; }
        let cube = this.cubes.get(this.selector.board_coord);
        if (!cube || cube.cube_type === 0) { return false; }
        this.selector.material.color.set(C.SELECTED_COLOR);
        this.selected = cube;
        return true;
    }

    deselect() {
        if (this.busy) { return false; }
        this.selected = null;
        this.selector.material.color.set(C.SELECTOR_COLOR);
        return true;
    }

    tselect() {
        if (this.selected) {
            this.deselect();
        }
        else {
            this.select();
        }
    }

    mdown(e) {
        this.isDragging = false;
    }
    mmove(e) {
        this.isDragging = true;
    }
    mup(e) {
        if (this.isDragging) { return; } // Don't select if we're just controlling scene
        let width = this.el.clientWidth;
        let height = this.el.clientHeight;
        let mouse = {
            x: (e.clientX / width) * 2 - 1,
            y: - (e.clientY / height) * 2 + 1
        }

        this.raycaster.setFromCamera(mouse, this.camera);
        
        let intersections = this.raycaster.intersectObjects(this.cube_grp.children);
        if (intersections[0]) {
            let cube = intersections[0].object;
            if (cube.cube_type > 0) {
                this.move_to(cube.board_coord);
            }
        }
    }
}

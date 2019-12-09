import * as C from './const.js';
import * as AMath from './ArrayMath.js';
import { ArrayND } from './ArrayND.js';

// Enclosure
const ENCLOSURE_SIZE = 200;
const ENCLOSURE_MATERIAL = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    side: THREE.BackSide
});
const ENCLOSURE_GEOMETRY = new THREE.BoxBufferGeometry(
        ENCLOSURE_SIZE, ENCLOSURE_SIZE, ENCLOSURE_SIZE
);

// Cubes
const CUBE_SIZE = 1;
const CUBE_GEOMETRY = new THREE.BoxBufferGeometry(
        CUBE_SIZE-0.05, CUBE_SIZE-0.05, CUBE_SIZE-0.05
);
const CUBE_MATERIALS = new Array(C.CUBE_COLORS.length);
CUBE_MATERIALS[0] = new THREE.MeshPhongMaterial({ color: C.CUBE_COLORS[0] });
for (let i = 1, len = CUBE_MATERIALS.length; i < len; ++i) {
    CUBE_MATERIALS[i] = new THREE.MeshLambertMaterial({ color: C.CUBE_COLORS[i] });
}

// Grid
const GRID_GEOMETRY = new THREE.EdgesGeometry(
        new THREE.PlaneBufferGeometry(CUBE_SIZE, CUBE_SIZE)
);
GRID_GEOMETRY.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -CUBE_SIZE/2));
const GRID_MATERIAL = new Array(3);
for (let i = 0; i < 3; ++i) {
    GRID_MATERIAL[i] = new THREE.LineBasicMaterial({ color: C.GRID_COLORS[i] });
}
const GRID_X = new THREE.LineSegments(GRID_GEOMETRY, GRID_MATERIAL[0]);
GRID_X.rotation.y = -90*(Math.PI/180);
const GRID_Y = new THREE.LineSegments(GRID_GEOMETRY, GRID_MATERIAL[1]);
const GRID_Z = new THREE.LineSegments(GRID_GEOMETRY, GRID_MATERIAL[2]);
GRID_Z.rotation.x = -90*(Math.PI/180);

// Grid Lines
const GRID_LINE_GEOMETRY = new THREE.BufferGeometry();
GRID_LINE_GEOMETRY.vertices.push(new THREE.Vector3(0, 0, 0));
GRID_LINE_GEOMETRY.vertices.push(new THREE.Vector3(1, 0, 0));
// TODO: use GRID_MATERIALS to make new THREE.Line clone that

// negate x, swap y and z
function t23(vec3) {
    let z = vec3[2];
    vec3[2] = vec3[1];
    vec3[1] = z;
    vec3[0] = -vec3[0];
    return vec3;
}
let b23 = t23; // scale if CUBE_SIZE !~=~ 1

export default class ThreeBoard {
    constructor(el, board) {
        this.el = el;
        this.board = board;
        this.dims = board.dims;

        const center = b23(AMath.scale(board.dims, 0.5));

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 75, this.el.clientWidth
                / this.el.clientHeight, 0.1, 1000);
        this.camera.position.set(...t23([14, 20, 16]));

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize( el.clientWidth, el.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        el.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera,
                this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.maxDistance = 100;
        this.controls.minDistance = 4;

        this.controls.target.set(...center);
        this.camera.lookAt(...center);

        let resize = function () {
            let width = this.el.clientWidth;
            let height = this.el.clientHeight;
            this.camera.aspect = width/height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }.bind(this);
        window.addEventListener('resize', resize);

        let animate = function () {
            requestAnimationFrame( animate );
            this.renderer.render(this.scene, this.camera);
        }.bind(this);
        animate(); // Begin animation

        // Setup board
        const enclosure = new THREE.Mesh(ENCLOSURE_GEOMETRY, ENCLOSURE_MATERIAL);
        enclosure.position.set(...t23([0, 0, ENCLOSURE_SIZE/2-5]));
        enclosure.receiveShadow = true;
        this.scene.add(enclosure);

        let x = this.dims[0];
        let y = this.dims[1];
        let z = this.dims[2];

        this.gridX = [];
        for (let j = 0; j < y; ++j) {
            for (let k = 0; k < z; ++k) {
                const gx = GRID_X.clone();
                gx.position.set(...b23([0, j, k]));
                gx.board_position = [0, j, k];
                this.gridX.push(gx);
                this.scene.add(gx);
            }
        }
        this.gridY = [];
        for (let i = 0; i < x; ++i) {
            for (let k = 0; k < z; ++k) {
                const gy = GRID_Y.clone();
                gy.position.set(...b23([i, 0, k]));
                gy.board_position = [i, 0, k];
                this.gridY.push(gy);
                this.scene.add(gy);
            }
        }
        this.gridZ = [];
        for (let i = 0; i < x; ++i) {
            for (let j = 0; j < y; ++j) {
                const gz = GRID_Z.clone();
                gz.position.set(...b23([i, j, 0]));
                gz.board_position = [i, j, 0];
                this.gridZ.push(gz);
                this.scene.add(gz);
            }
        }

        this.cubes = new ArrayND(this.dims, null);
        for (let i = 0; i < x; ++i) {
            for (let j = 0; j < y; ++j) {
                for (let k = 0; k < z; ++k) {
                    let type = board.get([i, j, k]);
                    if (type < 0) { continue; }
                    let cube = new THREE.Mesh(CUBE_GEOMETRY, CUBE_MATERIALS[type].clone());
                    cube.castShadow = true;
                    cube.position.set(...b23([i, j, k]));
                    this.cubes.set([i, j, k], cube);
                    this.scene.add(cube);
                }
            }
        }

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xFFFFFF, 1, 500, 2);
        pointLight.position.set(...t23([51, 49, 70]));
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        pointLight.shadow.camera.near = 60;
        pointLight.shadow.camera.far = 248;
        this.scene.add(pointLight);
    }

    separate(factor) {
        if (factor < 1) { throw new Error("Separation factor must be > 1"); }
        let x = this.dims[0];
        let y = this.dims[1];
        let z = this.dims[2];
        for (let i = 0, len = this.gridX.length; i < len; ++i) {
            let gx = this.gridX[i];
            let pos = AMath.scale(gx.board_position, factor);
            gx.position.set(...b23(pos));
        }
        for (let i = 0, len = this.gridY.length; i < len; ++i) {
            let gy = this.gridY[i];
            let pos = AMath.scale(gy.board_position, factor);
            gy.position.set(...b23(pos));
        }
        for (let i = 0, len = this.gridZ.length; i < len; ++i) {
            let gz = this.gridZ[i];
            let pos = AMath.scale(gz.board_position, factor);
            gz.position.set(...b23(pos));
        }
        for (let i = 0; i < x; ++i) {
            for (let j = 0; j < y; ++j) {
                for (let k = 0; k < z; ++k) {
                    let cube = this.cubes.get([i, j, k]);
                    if (cube === null) { continue; }
                    cube.position.set(...b23([factor*i, j*factor, k*factor]));
                }
            }
        }
    }

    fade(layers, opacity=0.2) {
        let x = this.dims[0];
        let y = this.dims[1];
        let z = this.dims[2];
        let cube = this.cubes.get([0, 0, 0]);
        cube.material.transparent = true;
        cube.material.opacity = 0.1;
        for (let i = 0; i < x; ++i) {
            for (let j = 0; j < y; ++j) {
                for (let k = 0; k < z; ++k) {
                    let cube = this.cubes.get([i, j, k]);
                    if (cube === null) { continue; }
                    if (i < layers || j < layers || k < layers
                            || i >= x-layers || j >= y-layers || k >= z-layers) {
                        cube.material.transparent = true;
                        cube.material.opacity = opacity;
                    }
                    else {
                        cube.material.transparent = false;
                        cube.material.opacity = 1;
                    }
                }
            }
        }
    }
}

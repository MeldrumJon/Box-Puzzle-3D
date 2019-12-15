import * as C from './const.js';
import * as AMath from './ArrayMath.js';
import { ArrayND } from './ArrayND.js';

// Enclosure
const loader = new THREE.TextureLoader();

const ENCLOSURE_SIZE = 200;
const ENCLOSURE_MATERIAL = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF,
    side: THREE.BackSide
});
const ENCLOSURE_GEOMETRY = new THREE.BoxBufferGeometry(
        ENCLOSURE_SIZE, ENCLOSURE_SIZE, ENCLOSURE_SIZE
);

// Cubes
const CUBE_SHRINK = 0.1;
const CUBE_GEOMETRY = new THREE.BoxBufferGeometry(
        C.CUBE_SIZE-CUBE_SHRINK,
        C.CUBE_SIZE-CUBE_SHRINK,
        C.CUBE_SIZE-CUBE_SHRINK
);
const CUBE_MATERIALS = new Array(C.CUBE_COLORS.length);
CUBE_MATERIALS[0] = new THREE.MeshLambertMaterial({ // Immovable
    color: C.CUBE_COLORS[0],
});
for (let i = 1, len = CUBE_MATERIALS.length; i < len; ++i) {
    CUBE_MATERIALS[i] = new THREE.MeshLambertMaterial({ // Movable
        color: C.CUBE_COLORS[i]
    });
}

// Grid
const GRID_SPACE = 0.01;
const GRID_GEOMETRY = new THREE.EdgesGeometry(
        new THREE.PlaneBufferGeometry(C.CUBE_SIZE, C.CUBE_SIZE)
);
GRID_GEOMETRY.applyMatrix(
        new THREE.Matrix4().makeTranslation(0, 0, -C.CUBE_SIZE/2)
);
const GRID_MATERIAL = new Array(3);
for (let i = 0; i < 3; ++i) {
    GRID_MATERIAL[i] = new THREE.LineBasicMaterial({
        color: C.GRID_COLORS[i],
        transparent: true,
        opacity: 0.5
    });
}
const GRID_X = new THREE.LineSegments(GRID_GEOMETRY, GRID_MATERIAL[0]);
GRID_X.rotation.y = -90*(Math.PI/180);
const GRID_Y = new THREE.LineSegments(GRID_GEOMETRY, GRID_MATERIAL[1]);
const GRID_Z = new THREE.LineSegments(GRID_GEOMETRY, GRID_MATERIAL[2]);
GRID_Z.rotation.x = -90*(Math.PI/180);

// Grid Lines
const GRID_LINE_GEOMETRY = new THREE.Geometry();
GRID_LINE_GEOMETRY.vertices.push(new THREE.Vector3(0, 0, 0));
GRID_LINE_GEOMETRY.vertices.push(new THREE.Vector3(0, 1, 0));
GRID_LINE_GEOMETRY.applyMatrix(new THREE.Matrix4().makeTranslation(C.CUBE_SIZE/2, -C.CUBE_SIZE/2, -C.CUBE_SIZE/2));
const GRID_LINE_X = new THREE.Line(GRID_LINE_GEOMETRY, GRID_MATERIAL[0]);
GRID_LINE_X.rotation.z = -90*(Math.PI/180);
const GRID_LINE_Y = new THREE.Line(GRID_LINE_GEOMETRY, GRID_MATERIAL[1]);
GRID_LINE_Y.rotation.x = -90*(Math.PI/180);
const GRID_LINE_Z = new THREE.Line(GRID_LINE_GEOMETRY, GRID_MATERIAL[2]);

// negate x, swap y and z
export function t23(vec3) {
    let nvec = new Array(3);
    nvec[2] = vec3[1];
    nvec[1] = vec3[2];
    nvec[0] = -vec3[0];
    return nvec;
}
export var b23 = t23; // scale if C.CUBE_SIZE !~=~ 1

export default class ThreeBoard {
    /**
     * Reorient THREE coordinate.
     */
    _t2T(coord) {
        let position = new THREE.Vector3(
            -coord[0],
            coord[2],
            coord[1]
        );
        return position;
    }

    /**
     * Convert board coordinate to THREE coordinate: reorienting and taking
     * into account separation factor.
     */
    _b2T(board_coord) {
        let position = this._t2T(board_coord);
        position.multiplyScalar(this.separation);
        return position;
    }

    _setBoardProps(obj3d, board_coord, cube_type=null) {
        obj3d.board_coord = board_coord;
        obj3d.cube_type = cube_type;
        obj3d.position.copy(this._b2T(board_coord));
    }

    constructor(el) {
        this.el = el;
        this.board = null;
        this.separation = 1; // Separation factor between cubes
        this.fadedLayers = 0;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 75, this.el.clientWidth
                / this.el.clientHeight, 0.1, ENCLOSURE_SIZE*2);
        this.camera.position.copy(this._t2T([14, 20, 16]));

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

        let orbitUpdate = function() {
            this.needsRender = true;
        }.bind(this);
        this.controls.addEventListener('change', orbitUpdate);

        let resizeDone = function () {
            let width = this.el.clientWidth;
            let height = this.el.clientHeight;
            this.camera.aspect = width/height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }.bind(this);
        let resize_id = 0;
        window.addEventListener('resize', function resized() {
            clearTimeout(resize_id);
            resize_id = window.setTimeout(resizeDone, 200);
        }, {passive: true});

        // Enclosure
        const enclosure = new THREE.Mesh(ENCLOSURE_GEOMETRY, ENCLOSURE_MATERIAL);
        enclosure.position.copy(this._t2T([0, 0, ENCLOSURE_SIZE/2-5]));
        enclosure.receiveShadow = true;
        this.scene.add(enclosure);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xFFFFFF, 1, 500, 2);
        pointLight.position.set(...t23([51, 49, 70]));
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 512;
        pointLight.shadow.mapSize.height = 512;
        pointLight.shadow.camera.near = 60;
        pointLight.shadow.camera.far = 248;
        this.scene.add(pointLight);

        this.needsRender = true;
    }

    beginRenderLoop() {
        let loop = function () {
            if (this.needsRender) {
                this.renderer.render(this.scene, this.camera);
                this.needsRender = false;
            }
            requestAnimationFrame(loop);
        }.bind(this);
        requestAnimationFrame(loop); // begin
    }

    setBoard(board) {
        this.board = board;
        const [x, y, z] = this.board.dims;
        const center = this._t2T([(x-1)/2, (y-1)/2, (z-1)/2]);

        this.controls.target.copy(center);
        this.camera.lookAt(center);

        this.grid_grp = new THREE.Group();
        for (let i = 0; i < x; ++i) {
            for (let j = 0; j < y; ++j) {
                for (let k = 0; k < z; ++k) {
                    if (i === 0) {
                        const gx = GRID_X.clone();
                        this._setBoardProps(gx, [-GRID_SPACE, j, k]);
                        this.grid_grp.add(gx);
                    }
                    if (j === 0) {
                        const gy = GRID_Y.clone();
                        this._setBoardProps(gy, [i, -GRID_SPACE, k]);
                        this.grid_grp.add(gy);
                    }
                    if (k === 0) {
                        const gz = GRID_Z.clone();
                        this._setBoardProps(gz, [i, j, -GRID_SPACE]);
                        this.grid_grp.add(gz);
                    }
                }
            }
        }
        // Grid Lines
        const gxl = GRID_LINE_X.clone();
        this._setBoardProps(gxl, [x, -GRID_SPACE, -GRID_SPACE]);
        this.grid_grp.add(gxl);

        const gyl = GRID_LINE_Y.clone();
        this._setBoardProps(gyl, [-GRID_SPACE, y, -GRID_SPACE]);
        this.grid_grp.add(gyl);
        
        const gzl = GRID_LINE_Z.clone();
        this._setBoardProps(gzl, [-GRID_SPACE, -GRID_SPACE, z]);
        this.grid_grp.add(gzl);

        this.scene.add(this.grid_grp);

        // Cubes
        this.cubes = new ArrayND(this.board.dims, null);
        this.cube_grp = new THREE.Group();
        for (let i = 0; i < x; ++i) {
            for (let j = 0; j < y; ++j) {
                for (let k = 0; k < z; ++k) {
                    let coord = [i, j, k];
                    let type = board.get(coord);
                    if (type < 0) { continue; }
                    let cube = new THREE.Mesh(
                            CUBE_GEOMETRY, CUBE_MATERIALS[type].clone()
                    );
                    cube.castShadow = true;
                    this._setBoardProps(cube, coord, type);
                    this.cubes.set([i, j, k], cube);
                    this.cube_grp.add(cube);
                }
            }
        }
        this.scene.add(this.cube_grp);

        this.fade_layers(this.fadedLayers);

        this.needsRender = true;
    }

    clearBoard() {
        this.scene.remove(this.grid_grp);
        this.scene.remove(this.cube_grp);
        this.needsRender = true;
    }

    totalLayers() {
        let min = Math.min(...this.board.dims);
        return ~~((min+1)/2);
    }

    separate(factor) {
        if (factor < 1) { throw new Error("Separation factor must be > 1"); }
        this.separation = factor;
        let grids = this.grid_grp.children;
        for (let i = 0, len = grids.length; i < len; ++i) {
            grids[i].position.copy(this._b2T(grids[i].board_coord));
        }
        let cubes = this.cubes.a;
        for (let i = 0, len = cubes.length; i < len; ++i) {
            if (cubes[i]) {
                cubes[i].position.copy(this._b2T(cubes[i].board_coord));
            }
        }
        this.needsRender = true;
    }

    fade_layers(layers, fade_immovable=true, opacity=0.1) {
        const [x, y, z] = this.cubes.dims;
        for (let i = 0; i < x; ++i) {
            for (let j = 0; j < y; ++j) {
                for (let k = 0; k < z; ++k) {
                    let cube = this.cubes.get([i, j, k]);
                    if (!cube) { continue; }
                    if ((i < layers || j < layers || k < layers
                            || i >= x-layers || j >= y-layers || k >= z-layers)
                            && (fade_immovable || cube.cube_type > 0)) {
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
        this.fadedLayers = layers;
        this.needsRender = true;
    }

    fade_others(coord, fade_immovable=true, opacity=0.1) {
        let cubes = this.cubes.a;
        for (let i = 0, len = cubes.length; i < len; ++i) {
            if (!cubes[i]) { continue; }
            const c = cubes[i].board_coord;
            if (AMath.equal(c, coord)) {
                cubes[i].material.transparent = false;
                cubes[i].material.opacity = 1;
            }
            else {
                cubes[i].material.transparent = true;
                cubes[i].material.opacity = opacity;
            }
        }
        this.needsRender = true;
    }

    fade_none() {
        let cubes = this.cubes.a;
        for (let i = 0, len = cubes.length; i < len; ++i) {
            if (!cubes[i]) { continue; }
            cubes[i].material.transparent = false;
            cubes[i].material.opacity = 1;
        }
        this.needsRender = true;
    }
}

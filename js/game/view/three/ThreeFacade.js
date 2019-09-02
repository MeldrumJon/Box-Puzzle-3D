import * as C from '../../constants.js';
import * as gridMaker from './gridMaker.js';

export default class ThreeFacade {
  static setCoords(obj3d, coords) {
    obj3d.position.set(coords[0], coords[1], coords[2]);
    return;
  }

  static translateObj3D(obj3d, transDist) {
    let oldPosition = [obj3d.position.x, obj3d.position.y, obj3d.position.z];
    ThreeFacade.setCoords(obj3d, transDist);
    let container = new THREE.Object3D();
    container.add(obj3d);
    ThreeFacade.setCoords(container, oldPosition);
    return container;
  }

  constructor(id, enAntiAliasing = true) {
    this.element = document.getElementById(id);
    let elWidth = this.element.clientWidth;
    let elHeight = this.element.clientHeight;

    this.renderer = new THREE.WebGLRenderer({antialias: enAntiAliasing});
    this.renderer.setSize(elWidth, elHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      C.CAMERA_FOV, elWidth / elHeight, C.CAMERA_NEAR, C.CAMERA_FAR
    );
    this.scene.add(this.camera);

    this.controls = new THREE.OrbitControls(
      this.camera, this.renderer.domElement
    );
		this.controls.noPan = true;

    this.element.appendChild(this.renderer.domElement);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(this.ambientLight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  beginAnimate() {
    this.render();
    this.controls.update();

    requestAnimationFrame(
      this.beginAnimate.bind(this)
    );
  }

  setTarget(coords) {
    this.controls.target.set(coords[0], coords[1], coords[2]);
    this.camera.lookAt(coords[0], coords[1], coords[2]);
  }

  moveCameraTo(coords) {
    ThreeFacade.setCoords(this.camera, coords);
  }

  elementUpdated() {
    let elWidth = this.element.clientWidth;
    let elHeight = this.element.clientHeight;
    this.renderer.setSize(elWidth, elHeight);
    this.camera.updateProjectionMatrix();
  }

  addOutline(coords) {
    let outline = new THREE.LineSegments(
      C.SELECTOR_GEO, C.SELECTOR_MATERIALS
    );
    let transDist = math.divide(C.SELECTOR_DIMS, 2);
    outline = ThreeFacade.translateObj3D(outline, transDist);
    ThreeFacade.setCoords(outline, coords);
    this.scene.add(outline);
    return outline;
  }

  addCube(coords, color) {
    let box = new THREE.Mesh(C.CUBE_GEO, C.CUBE_MATERIALS[color]);
    let transDist = math.divide(C.CUBE_DIMS, 2);
    box = ThreeFacade.translateObj3D(box, transDist);
    box.castShadow = true;
    box.receiveShadow = true;
    ThreeFacade.setCoords(box, coords);
    this.scene.add(box);
    return box;
  }

  add3DGrid(coords, dims, lengths) {
    let grid = gridMaker.create3DGrid(
      dims, lengths, C.AXIS_COLORS, C.AXIS_OPACITY
    );
    this.scene.add(grid);
    return grid;
  }

  addLight(coords) {
    // let directional = new THREE.DirectionalLight(
    //   C.DIR_LIGHT_COLOR, C.DIR_LIGHT_OPACITY
    // );
    let directional = new THREE.PointLight( 0xffffff, 1, 100 );
    directional.castShadow = true;
    directional.shadow.camera.near = 0.1;
    directional.shadow.camera.far = 25;
    ThreeFacade.setCoords(directional, coords);
    this.scene.add(directional);
    return directional;
  }
}

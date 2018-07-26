// THREE CONSTANTS
// camera
export const CAMERA_FOV = 45;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 1000;
export const CAMERA_POS_SCALAR = 1.5;

// lights
export const AMBIENT_LIGHT_COLOR = 0x666666;
export const DIR_LIGHT_COLOR = 0xffffff;
export const DIR_LIGHT_OPACITY = 0.8;
export const DIR_LIGHT_POS_SCALAR = 2;

// View
export const CUBE_W = 1;
export const CUBE_DIMS = [CUBE_W, CUBE_W, CUBE_W];
export const CUBE_GEO = new THREE.BoxGeometry(CUBE_W, CUBE_W, CUBE_W);
export const CUBE_COLORS = [
  0xff0000, // 0
  0xffff00, // 1
  0xff00ff, // 2
  0x00ff00, // 3
  0x0055ff, // 4
  0x00ffff, // 5
];
export const CUBE_MATERIALS = [
  // materials are generated in the following loop.
];
for (let i = 0; i < CUBE_COLORS.length; ++i) {
  CUBE_MATERIALS[i] = new THREE.MeshLambertMaterial({
    color: CUBE_COLORS[i],
  });
}
export const SELECTOR_W = 1.025;
export const SELECTOR_DIMS = [SELECTOR_W, SELECTOR_W, SELECTOR_W];
export const SELECTOR_GEO = new THREE.EdgesGeometry(
  new THREE.BoxGeometry(SELECTOR_W, SELECTOR_W, SELECTOR_W)
);
export const SELECTOR_COLOR = 0xffff66;
export const SELECTOR_MATERIALS = new THREE.LineBasicMaterial({
  color: SELECTOR_COLOR,
});
export const SELECTOR_SELECTED_COLOR = 0x551A8B;
export const SELECTOR_SELECTED_MATERIALS = new THREE.LineBasicMaterial({
  color: SELECTOR_SELECTED_COLOR,
});


export const GREY_CUBE_COLOR = 0x555555;
export const GREY_CUBE_MATERIAL = new THREE.MeshLambertMaterial({
    color: GREY_CUBE_COLOR,
  });

// axis
export const AXIS_POSITION = [0, 0, 0];
export const AXIS_COLORS = [0xff0000, 0x00ff00, 0x0099ff]; // [x, y, z]
export const AXIS_OPACITY = 0.2;

export const THREE_ORIGIN = [0, 0, 0];

import * as C from '../constants.js';

export function createLine(startVector, endVector, color, opacity) {
    let geo = new THREE.Geometry();
    let material = new THREE.LineBasicMaterial({
      color: color,
      opacity: opacity,
    });
    geo.vertices.push(startVector);
    geo.vertices.push(endVector);
    let line = new THREE.LineSegments(geo, material);
    return line;
}

export function createGrid(width, height, dimW, dimH, color, opacity) {
    let geo = new THREE.Geometry();
    let material = new THREE.LineBasicMaterial({
      color: color,
      opacity: opacity,
    });
    let stepW = width / dimW;
    let stepH = height / dimH;
    for (let i = 0; i <= dimW; ++i) {
      geo.vertices.push(new THREE.Vector3(0, i*stepW, 0));
      geo.vertices.push(new THREE.Vector3(0, i*stepW, height)); 
    }
    for (let i = 0; i <= dimH; ++i) {
      geo.vertices.push(new THREE.Vector3(0, 0, i*stepH));
      geo.vertices.push(new THREE.Vector3(0, width, i*stepH));
    }
    let grid = new THREE.LineSegments(geo, material);
    return grid;
}

export function create3DGrid(dims, colors, opacity, scale) {
    let grid = new THREE.Object3D();
    let xDim = dims[0];
    let yDim = dims[1];
    let zDim = dims[2];
    let xLength = xDim * scale;
    let yLength = yDim * scale;
    let zLength = zDim * scale;
    let xColor = colors[0];
    let yColor = colors[1];
    let zColor = colors[2];

    let xPlane = createGrid(yLength, zLength, yDim, zDim,
      xColor, opacity);
    grid.add(xPlane);

    let yPlane = createGrid(xLength, zLength, xDim, zDim,
      yColor, opacity);
    yPlane.rotation.z += -Math.PI/2;
    grid.add(yPlane);

    let zPlane = createGrid(xLength, yLength, xDim, yDim,
      zColor, opacity);
    zPlane.rotation.x += -Math.PI/2;
    zPlane.rotation.z += -Math.PI/2;
    grid.add(zPlane);

    let xAxis = createLine(
      new THREE.Vector3(xLength, 0, 0),
      new THREE.Vector3(xLength + scale, 0, 0),
      xColor,
      opacity
    );
    grid.add(xAxis);

    let yAxis = createLine(
      new THREE.Vector3(0, yLength, 0),
      new THREE.Vector3(0, yLength + scale, 0),
      yColor,
      opacity
    );
    grid.add(yAxis);

    let zAxis = createLine(
      new THREE.Vector3(0, 0, zLength),
      new THREE.Vector3(0, 0, zLength + scale),
      zColor,
      opacity
    );
    grid.add(zAxis);
    this.scene.add(grid);
    return grid;
}

export function createCube(cube) {
  let x = cube.coords[0];
  let y = cube.coords[1];
  let z = cube.coords[2];
  let geo = C.CUBE_GEO;
  let mat = C.CUBE_MATERIALS[cube.color];

  let mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);

  // position cube based on its corner, not its center
  let transDist = C.CUBE_W/4;
  mesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(
    transDist, transDist, transDist
  ));
  return mesh;
}

export function createLights(lengths) {
  let lights = new THREE.Object3D();
  let ambient = new THREE.AmbientLight(C.AMBIENT_LIGHT_COLOR);
  lights.add(ambient);
  let directional = new THREE.DirectionalLight(C.DIR_LIGHT_COLOR,
    C.DIR_LIGHT_OPACITY);
  let dirLightPos = math.multiply(lengths, C.DIR_LIGHT_POS_SCALAR);
  directional.position.set(dirLightPos[0], dirLightPos[1], dirLightPos[2]);
  lights.add(directional);
  return lights;
}

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

export function create3DGrid(dims, lengths, colors, opacity) {
  let grid = new THREE.Object3D();
  let scale = [
    lengths[0]/dims[0],
    lengths[1]/dims[1],
    lengths[2]/dims[2],
  ];
  let xPlane = createGrid(lengths[1], lengths[2], dims[1], dims[2],
    colors[0], opacity);
  grid.add(xPlane);
  let yPlane = createGrid(lengths[0], lengths[2], dims[0], dims[2],
    colors[1], opacity);
  yPlane.rotation.z += -Math.PI/2;
  grid.add(yPlane);
  let zPlane = createGrid(lengths[0], lengths[1], dims[0], dims[1],
    colors[2], opacity);
  zPlane.rotation.x += -Math.PI/2;
  zPlane.rotation.z += -Math.PI/2;
  grid.add(zPlane);
  let xAxis = createLine(
    new THREE.Vector3(lengths[0], 0, 0),
    new THREE.Vector3(lengths[0] + scale[0], 0, 0),
    colors[0],
    opacity
  );
  grid.add(xAxis);
  let yAxis = createLine(
    new THREE.Vector3(0, lengths[1], 0),
    new THREE.Vector3(0, lengths[1] + scale[1], 0),
    colors[1],
    opacity
  );
  grid.add(yAxis);
  let zAxis = createLine(
    new THREE.Vector3(0, 0, lengths[2]),
    new THREE.Vector3(0, 0, lengths[2] + scale[2]),
    colors[2],
    opacity
  );
  grid.add(zAxis);
  return grid;
}

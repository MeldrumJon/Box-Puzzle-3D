
export default class CubeView {
    constructor(threeFacade, cube) {
        this.threeFacade = threeFacade;
        this.modelCube = cube;
        this.modelCube.registerView(this);
        this.threeCube = this.threeFacade.addCube(
            this.modelCube.coords, this.modelCube.color
        );
    }

    slide(callback) {
        this.move(callback);
    }
    move(callback) {
        let coords = this.modelCube.coords;
        this.threeCube.position.set(coords[0], coords[1], coords[2]);
        callback();
    }
}

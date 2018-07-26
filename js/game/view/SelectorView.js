import * as C from '../constants.js';
export default class SelectorView {
    constructor(threeFacade, selector) {
        this.threeFacade = threeFacade;
        this.modelSelector = selector;
        this.modelSelector.registerView(this);
        this.threeSelector = this.threeFacade.addOutline(
            this.modelSelector.coords
        );
    }

    slide(callback) {
        this.move(callback); // placeholder
    }

    move(callback) {
        let coords = this.modelSelector.coords;
        this.threeSelector.position.set(coords[0], coords[1], coords[2]);
        callback();
    }

    yellow() {
        this.threeSelector.children[0].material.color = new THREE.Color(C.SELECTOR_COLOR);
    }

    green() {
        this.threeSelector.children[0].material.color = new THREE.Color(C.SELECTOR_SELECTED_COLOR);
    }
}

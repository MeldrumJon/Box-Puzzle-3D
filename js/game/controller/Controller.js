import Commander from './Commander.js';
import SelectCommand from './commands/SelectCommand.js';
import MoveBoxCommand from './commands/MoveBoxCommand.js';
import MoveSelectorCommand from './commands/MoveSelectorCommand.js';

export default class Controller {
    constructor(selector) {
        this.selector = selector; // selector from the model

        this.commander = new Commander();
        document.addEventListener('keypress', this.move.bind(this), false);
    }

    move(e) {
        let direction;
        switch (e.keyCode) {
            case 113:
                direction = [1, 0, 0];
                break;
            case 97:
                direction = [-1, 0, 0];
                break;
            case 119:
                direction = [0, 1, 0];
                break;
            case 115:
                direction = [0, -1, 0];
                break;
            case 101:
                direction = [0, 0, 1];
                break;
            case 100:
                direction = [0, 0, -1];
                break;
            case 32:
                this.commander.do(
                    new SelectCommand(this.selector)
                );
                return;
            default:
                direction = [0, 0, 0];
                break;
        }
        let command;
        if (this.selector.selected === null) {
            command = new MoveSelectorCommand(this.selector, direction);
        }
        else {
            command = new MoveBoxCommand(this.selector, direction);
        }
        this.commander.do(command);
    }
}

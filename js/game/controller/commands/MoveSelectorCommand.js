import Command from './Command.js';

export default class MoveSelectorCommand extends Command {
    constructor(selector, direction) {
        super();
        this.selector = selector;
        this.direction = direction;
    }

    execute(callback) {
        this.selector.move(this.direction);
        this.selector.view.slide(callback);
    }
}
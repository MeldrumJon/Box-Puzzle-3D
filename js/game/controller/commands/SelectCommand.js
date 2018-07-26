import Command from './Command.js';

export default class MoveSelectorCommand extends Command {
	constructor(selector) {
		super();
		this.selector = selector;
	}

	execute(callback) {
		let valid = this.selector.select();
		if (valid) {
			this.selector.view.green();
		}
		else {
			this.selector.view.yellow();
		}
		callback();
	}
}

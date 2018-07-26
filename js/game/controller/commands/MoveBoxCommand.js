import Command from './Command.js';

export default class MoveBoxCommand extends Command {
  constructor(selector, direction) {
		super();
		this.selector = selector;
		this.direction = direction;
	}
  execute(callback) {
		let cube = this.selector.selected;
		cube.move(this.direction);
		this.selector.setPosition(cube.coords);
		cube.view.slide(function(){});
		this.selector.view.slide(callback);
	}
}

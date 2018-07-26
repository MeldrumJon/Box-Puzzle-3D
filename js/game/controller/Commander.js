

export default class Commander {
  constructor() {
		this.commands = []; // command queue
		this.executed = []; // undo stack
		this.busy = false;
	}

  do(command) {
		this.commands.push(command);
		if (!this.busy) { // call work if not already working
			this.work();
		}
	}

	work() {
		if (this.commands.length === 0) { // nothing else to do
			this.busy = false;
			return;
		}
		this.busy = true;
		console.log(this.commands);
		let command = this.commands.shift();
		console.log(command);
		command.execute(
			this.work.bind(this) // callback: keep working until queue is full
		);
	}
}

import { makeAutoObservable } from 'mobx';

const LOG_LIMIT_COUNT = 50;
const OPEN_TIMEOUT = 30000;

export class Store {
	private _isVisible = true;

	get isVisible(): boolean {
		return this._isVisible;
	}

	constructor() {
		makeAutoObservable(this);
	}

	public list: Array<{
    text: string;
    time: string;
  }> = [];

	private timerHide?: NodeJS.Timeout;

	public Add = (text: string) => {
		const date = new Date()
			.toISOString()
			.replace(/T/, ' ')
			.replace(/\..+/, '')
			.split(' ')[1];
		const log = {
			text: text,
			time: date
		};

		if(this.timerHide)
		{
			clearTimeout(this.timerHide);
			this.timerHide = undefined;
		}
		this.timerHide = setTimeout(() =>
			this._isVisible = false, OPEN_TIMEOUT);

		this.list.unshift(log);

		if (this.list.length > LOG_LIMIT_COUNT) {
			this.list.splice(0, 1);
		}
	};
}

export const Log = new Store();

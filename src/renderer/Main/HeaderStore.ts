import { makeAutoObservable } from 'mobx';

export class HeaderStore {
	constructor() {
		makeAutoObservable(this);
	}

	public menu = new Map<string, {
    isOpen: boolean;
    clickTime: number;
  }>();
}

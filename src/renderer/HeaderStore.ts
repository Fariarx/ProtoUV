import { runInAction } from 'mobx';
import { AppStore } from './AppStore';
import { SubscribersMouseClick } from './Shared/Libs/Listerners';

export class HeaderStore {
	public static instance: HeaderStore;

	public static getInstance(): HeaderStore {
		if (!HeaderStore.instance)
		{
			HeaderStore.instance = new HeaderStore();
		}

		return HeaderStore.instance;
	}

	private constructor() {
		AppStore.header = this;
		this.subscribers();
	}

	private subscribers() {
		let first = true;

		SubscribersMouseClick.push(() => setTimeout(() => {
			if (first)
			{
				first = false;
				return;
			}
			[...this.menu.keys()].forEach(key => {
				const value = this.menu.get(key)!;
				if (value.isOpen && Date.now() - value.clickTime > 100)
				{
					runInAction(() => {
						value.isOpen = false;
					});
				}
			});
		}));
	}

	private menu = new Map<string, MenuItem>();

	public getMenuItem = (name: string) => (this.menu.has(name) ? this.menu
		: this.menu.set(name, MenuItemDefault())).get(name)!;

	public setMenuItemOpen = (name: string) => {
		const item = this.getMenuItem(name);
		item.isOpen = !item.isOpen;
		item.clickTime = Date.now();
		return item;
	};

	public setupMenuItemBinds = (name: string, binds: BindItem[]) => {
		const item = this.getMenuItem(name);
		if (JSON.stringify(item.bindItems) !== JSON.stringify(binds))
		{
			item.bindItems = binds;
		}
		return item;
	};
}

export type BindItem = {
  name: string;
  func: () => void;
};

type MenuItem = {
  isOpen: boolean;
  clickTime: number;
  bindItems: BindItem[];
};

const MenuItemDefault = () => {
	return {
		isOpen: false,
		clickTime: Date.now(),
		bindItems: []
	};
};

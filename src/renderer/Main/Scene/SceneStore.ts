import { runInAction } from 'mobx';
import { AppStore, Log, Pages } from '../../AppStore';
import { Config } from '../../Shared/Config';
import { Printer } from '../Printer/Configs/Printer';
import { SceneInitializer } from './SceneInitializer';

export class SceneStore extends SceneInitializer {
	public printerName: string = Config.settings.printerName;
	public printer?: Printer;

	public constructor() {
		super();
		this.setupPrinter();
	}

	public setupPrinter() {
		let printer;

		if(this.printerName)
		{
			printer = Printer.LoadConfigFromFile(this.printerName);
		}

		if(printer)
		{
			this.printer = printer;
		}
		else
		{
			runInAction(() => {
				AppStore.instance.state = Pages.Configurator;
				console.log(AppStore.instance);
			});
			Log('Printer configuration empty!');
		}
	}
}

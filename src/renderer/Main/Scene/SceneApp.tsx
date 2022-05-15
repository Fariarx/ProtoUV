
import { Box } from '@mui/material';
import { observer } from 'mobx-react';
import { Printer } from '../Printer/Configs/Printer';
import { Configurator } from '../Printer/Configurator/App';

export const SceneApp = observer(() => {
	return <Box>
		{!sceneStore.printer && <Configurator setupConfiguration={(config: Printer)=>{
			storeMain.set('printer', config.name);

			sceneStore.printerName = config.name;
			sceneStore.printer = config;

			Log('Configuration loaded!');

			sceneStore.ini.updatePrinter();
			sceneStore.ini.updateCameraLookPosition();
			sceneStore.ini.animate();

			this.setState({});
		}}/>}

		{this.props.children}
	</Box>;
});

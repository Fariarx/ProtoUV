import { Box } from '@mui/material';
import { observer } from 'mobx-react';

export const SceneApp = observer(() => {
	return <Box>
		{!sceneStore.printer && <ContainerPrinterConfigurator setupConfiguration={(config: Printer)=>{
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

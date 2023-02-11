import { Box, Button, ButtonGroup, Divider } from '@mui/material';
import { observer } from 'mobx-react';
import { GridFields, StringFields } from './Shared/Edit';
import { AppStore, Pages } from '../AppStore';
import { Printer } from '../Main/Printer/Configs/Printer';
import { config, saveConfig } from '../Shared/Config';
import { colors } from '../Shared/Config';
import { FlexBoxColumn, FlexBoxColumnFit, flexChildrenCenter } from '../Shared/Styled/FlexBox';
import { Sizes } from '../Shared/Styled/Sizes';

export const ConfiguratorManuallyApp = observer(() => {
	const printer = AppStore.instance.tempPrinter
		? AppStore.instance.tempPrinter
		: Printer.LoadDefaultConfigFromFile();

	if (!printer) {
		AppStore.changeState(Pages.Configurator);
		return <Box/>;
	}

	const save = () => {
		AppStore.sceneStore.printerName = printer.Name;
		config.printerName = printer.Name;
		Printer.SaveToFile(printer);
		AppStore.sceneStore.printer = printer;
		AppStore.changeState(Pages.Main);
		saveConfig();
	};

	return <FlexBoxColumn sx={{
		width: '100%',
		height: '100%',
		padding: Sizes.multiply(Sizes.twentyFour, 2),
	}}>
		<FlexBoxColumn sx={{
			width: '100%',
			height: '100%',
			overflow: 'auto',
			flexGrow: 1,
			...flexChildrenCenter
		}}>
			<FlexBoxColumnFit sx={{
				height: 'fit-content',
			}}>
				<StringFields text={printer.Name} setText={x => printer.Name = x} label={'Configuration name'} autoFocus/>
				<GridFields obj={printer.Resolution} name={'Resolution'}/>
				<Divider sx={{ mt: Sizes.twelve, mb: Sizes.twelve, transform: 'translateY(12px)', borderColor: colors.background.heavy }}/>
				<GridFields obj={printer.Workspace} name={'Workspace'}/>
				<Divider sx={{ mt: Sizes.twelve, mb: Sizes.twelve, transform: 'translateY(12px)', borderColor: colors.background.heavy }}/>
				<GridFields obj={printer.PrintSettings} name={'Print Settings'}/>
				<StringFields  text={printer.Export.Encoder+', ' + printer.Export.Extencion} label={'Encoder, extension'} sx={{ mt: '12px' }}  setText={x => {
					printer.Export.Encoder = x.split(',')[0].trim();
					printer.Export.Extencion = x.split(',')[1].trim();
				}}/>
				<ButtonGroup variant="outlined" sx={{
					width: Sizes.multiply(Sizes.twentyFour, 12),
					mt: Sizes.twentyFour
				}}>
					<Button onClick={() => {
						AppStore.instance.tempPrinter = printer;
						AppStore.changeState(Pages.Configurator);
					}} sx={{
						width: '100%',
						borderRadius: Sizes.twentyFour
					}}>Back</Button>
					<Button onClick={save} sx={{
						width: '100%',
						borderRadius: Sizes.twentyFour
					}}>Save</Button>
				</ButtonGroup>
			</FlexBoxColumnFit>
		</FlexBoxColumn>
	</FlexBoxColumn>;
});

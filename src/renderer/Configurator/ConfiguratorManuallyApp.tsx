import { Box, Button, ButtonGroup, Divider, Grid, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { AppStore, Pages } from '../AppStore';
import { Printer } from '../Main/Printer/Configs/Printer';
import { config, saveConfig } from '../Shared/Config';
import { colors } from '../Shared/Config';
import { FlexBoxColumn, FlexBoxColumnFit, flexChildrenCenter } from '../Shared/Styled/FlexBox';
import { Sizes } from '../Shared/Styled/Sizes';
import { GridFields, NameField } from './Shared/Edit';

export let tempPrinter: Printer | undefined;

export const ConfiguratorManuallyApp = observer(() => {
	const printer = tempPrinter ? tempPrinter : Printer.LoadDefaultConfigFromFile();

	if (!printer) {
		AppStore.changeState(Pages.Configurator);
		return <Box/>;
	}

	const save = () => {
		AppStore.sceneStore.printerName = config.printerName = printer.name;
		Printer.SaveToFile(printer);
		AppStore.sceneStore.printer = printer;
		AppStore.changeState(Pages.Main);
		saveConfig();
	};

	return <FlexBoxColumn>
		<FlexBoxColumn sx={{
			width: 'unset',
			height: 'unset',
			flexGrow: 1,
			...flexChildrenCenter,
			padding: Sizes.multiply(Sizes.twentyFour, 2),
			pt: 0,
			pb: 0
		}}>
			<FlexBoxColumnFit sx={{
				minHeight: '100px',
				height: 'fit-content',
				overflow: 'auto'
			}}>
				<NameField text={printer.name} setText={x => printer.name = x}/>
				<GridFields obj={printer.Resolution} name={'Resolution'}/>
				<Divider sx={{ mt: Sizes.twelve, mb: Sizes.twelve, transform: 'translateY(12px)', borderColor: colors.background.heavy }}/>
				<GridFields obj={printer.Workspace} name={'Workspace'}/>
				<Divider sx={{ mt: Sizes.twelve, mb: Sizes.twelve, transform: 'translateY(12px)', borderColor: colors.background.heavy }}/>
				<GridFields obj={printer.PrintSettings} name={'Print Settings'}/>
				<ButtonGroup variant="outlined" sx={{
					width: Sizes.multiply(Sizes.twentyFour, 12),
					mt: Sizes.twentyFour
				}}>
					<Button onClick={() => {
						tempPrinter = printer;
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

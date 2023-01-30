import { Box, Button, ButtonGroup } from '@mui/material';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { AppStore, Pages } from 'renderer/AppStore';
import { GridFields, NameField } from 'renderer/Configurator/Shared/Edit';
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { config, saveConfig } from 'renderer/Shared/Config';
import { FlexBoxColumn, FlexBoxColumnFit, flexChildrenCenter } from 'renderer/Shared/Styled/FlexBox';
import { Sizes } from 'renderer/Shared/Styled/Sizes';

export const ConfiguratorSupport = observer(() => {
	const printer = AppStore.sceneStore.printer;

	if (!printer || !printer.SupportPreset) {
		return <Box/>;
	}

	const preset = _.clone(printer.SupportPreset);

	const save = () => {
		AppStore.sceneStore.printerName = config.printerName = printer.Name;
		Printer.SaveToFile(printer);
		AppStore.sceneStore.printer!.SupportPreset = preset;
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
				<NameField text={preset.Name} setText={x => preset.Name = x}/>
				<GridFields obj={preset} name={'Supports preset edit'}/>

				<ButtonGroup variant="outlined" sx={{
					width: Sizes.multiply(Sizes.twentyFour, 12),
					mt: Sizes.twentyFour
				}}>
					<Button onClick={() => {
						AppStore.changeState(Pages.Main);
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

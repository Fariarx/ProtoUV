import { Box, Button, ButtonGroup, Divider, Grid, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { AppStore, Pages } from '../AppStore';
import { Printer } from '../Main/Printer/Configs/Printer';
import { colors } from '../Shared/Colors';
import { config, saveConfig } from '../Shared/Config';
import { FlexBoxColumn, FlexBoxColumnFit, flexChildrenCenter } from '../Shared/Styled/FlexBox';
import { Sizes } from '../Shared/Styled/Sizes';

export let tempPrinter: Printer | undefined;

export const ConfiguratorManuallyApp = observer(() => {
	const printer = tempPrinter ? tempPrinter : Printer.LoadDefaultConfigFromFile();
	if (!printer) {
		AppStore.setState(Pages.Configurator);
		return <Box/>;
	}

	const save = () => {
		AppStore.sceneStore.printerName = config.printerName = printer.name;
		Printer.SaveToFile(printer);
		AppStore.sceneStore.printer = printer;
		AppStore.setState(Pages.Main);
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
				<NameField printer={printer}/>
				<GridFields obj={printer.Resolution} name={'Resolution'}/>
				<Divider sx={{ mt: Sizes.twelve, mb: Sizes.twelve, transform: 'translateY(12px)' }}/>
				<GridFields obj={printer.Workspace} name={'Workspace'}/>
				<Divider sx={{ mt: Sizes.twelve, mb: Sizes.twelve, transform: 'translateY(12px)' }}/>
				<GridFields obj={printer.PrintSettings} name={'Print Settings'}/>
				<ButtonGroup variant="outlined" sx={{
					width: Sizes.multiply(Sizes.twentyFour, 12),
					mt: Sizes.twentyFour
				}}>
					<Button onClick={() => {
						tempPrinter = printer;
						AppStore.setState(Pages.Configurator);
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

const GridFields = (props: {obj: any, name: string}) => <FlexBoxColumnFit sx={{
	width: '100%',
	maxWidth: '1000px',
	height: 'unset'
}}>
	<Typography variant={'h6'} sx={{
		color: colors.background.white,
		margin: Sizes.eight,
		marginTop: Sizes.twelve
	}}>
		{props.name}
	</Typography>
	<Grid container spacing={2} sx={{ width: '100%', height: 'unset' }} >
		{Object.entries(props.obj)
			.map((x: [string, unknown]) => <Grid key={x[0]} item xs={3}>
				<NumberField {...props} pair={x}/>
			</Grid>)}
	</Grid>
</FlexBoxColumnFit>;

const NameField = (props: {printer: Printer}) => {
	const [error, setterError] = useState(false);

	return <FlexBoxColumnFit sx={{
		width: '100%',
		maxWidth: '1000px',
		height: 'unset'
	}}>
		<TextField autoFocus
			variant="filled"
			error={error}
			defaultValue={props.printer.name}
			label={'Printer configuration name'}
			sx={{ width: '70%' }}
			onChange={(y) => {
				if (y.currentTarget.value && y.currentTarget.value.length > 3 && y.currentTarget.value.length < 128)
				{
					props.printer.name = y.currentTarget.value;
					setterError(false);
				}
				else {
					setterError(true);
				}
			}}
			InputLabelProps={{
				shrink: true,
			}}
		/>
	</FlexBoxColumnFit>;
};

const NumberField = (props: {obj: any, name: string, pair: [string, unknown]}) => {
	const [error, setterError] = useState(false);

	return <TextField variant="filled"
		label={props.pair[0]}
		sx={{ width: '100%' }}
		type="number"
		error={error}
		defaultValue={props.pair[1]}
		onChange={(y) => {
			if (y.currentTarget.value && y.currentTarget.value !== '0')
			{
				props.obj[props.pair[0] as string] = y.currentTarget.value;
				setterError(false);
			}
			else {
				setterError(true);
			}
		}}
		InputLabelProps={{
			shrink: true,
		}}
	/>;
};

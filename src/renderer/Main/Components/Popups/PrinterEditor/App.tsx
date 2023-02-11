import { Box, Grid, Grow, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { AppStore } from '../../../../AppStore';
import { colors, config, saveConfig } from '../../../../Shared/Config';
import { Sizes } from '../../../../Shared/Styled/Sizes';
import { Printer } from '../../../Printer/Configs/Printer';
import { DescriptionRow, Value } from '../SupportEditor/App';

export const PrinterEditorApp = observer(() => {
	if (!AppStore.sceneStore.isOpenPrinterEditor)
	{
		return <Box/>;
	}

	const printer = AppStore.sceneStore.printer!;

	const close = () => {
		if (!AppStore.sceneStore.printerName.includes('Manually'))
		{
			AppStore.sceneStore.printerName += ' Manually';
      AppStore.sceneStore.printer!.Name += ' Manually';
		}
		config.printerName = AppStore.sceneStore.printerName;
		AppStore.sceneStore.isOpenPrinterEditor = false;
		Printer.SaveToFile(printer);
		saveConfig();
	};

	const gridItem = (item: [string, string | number], onChange: (value: string | number) => void) => {
		const name = item[0];
		const value = item[1];
		const description = Description(name) as DescriptionRow;

		return <Grid item key={name}>
			<Value
				color={colors.scene.x}
				description={description}
				value={value}
				updateValue={newValue => {
					onChange(newValue);
					AppStore.sceneStore.printer =
            { ...AppStore.sceneStore.printer } as Printer;
				}}/>
		</Grid>;
	};

	return <Box onMouseDown={close} sx={{
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(114,114,114,0.47)',
		position: 'absolute',
		zIndex: 9999,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	}}>
		<Grow in>
			<Box onMouseDown={(e) => e.stopPropagation()} sx={{
				borderRadius: Sizes.four,
				border: '1px solid ' + colors.background.darkest,
				p: 1, pt: 0.5, minWidth: '120px',
				bgcolor: colors.background.heavy,
				marginLeft: Sizes.sum(Sizes.twentyFour, '-4px'),
				width: 'fit-content',
				maxWidth: '80%',
				height: 'fit-content',
				maxHeight: '80%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				overflow: 'auto'
			}}>
				<Typography variant='body1' alignSelf={'start'} mb={0.5}>
          Edit printer settings
				</Typography>
				<Grid container gap={1}>
					{gridItem(['Name', printer.Name], (v: string | any) => {
						printer.Name = v;
						AppStore.sceneStore.printerName = v;
						console.log(v);
					})}
					<Grid item  xs={12}>
						<Typography variant='body2' alignSelf={'start'}>
              Resolution
						</Typography>
					</Grid>
					{gridItem(['ResolutionX', printer.Resolution.X], (v: string | any) => printer.Resolution.X = v)}
					{gridItem(['ResolutionY', printer.Resolution.Y], (v: string | any) => printer.Resolution.Y = v)}
					<Grid item  xs={12}>
						<Typography variant='body2' alignSelf={'start'}>
              Workspace
						</Typography>
					</Grid>
					{gridItem(['WorkspaceX', printer.Workspace.SizeX], (v: string | any) => printer.Workspace.SizeX = v)}
					{gridItem(['WorkspaceY', printer.Workspace.SizeY], (v: string | any) => printer.Workspace.SizeY = v)}
					{gridItem(['WorkspaceZ', printer.Workspace.Height], (v: string | any) => printer.Workspace.Height = v)}
					<Grid item  xs={12}>
						<Typography variant='body2' alignSelf={'start'}>
              Print settings
						</Typography>
					</Grid>
					{gridItem(['LayerHeight', printer.PrintSettings.LayerHeight], (v: string | any) => printer.PrintSettings.LayerHeight = v)}
					{gridItem(['ExposureIndent', printer.PrintSettings.ExposureIndent], (v: string | any) => printer.PrintSettings.ExposureIndent = v)}
					{gridItem(['ExposureTime', printer.PrintSettings.ExposureTime], (v: string | any) => printer.PrintSettings.ExposureTime = v)}
					{gridItem(['LiftingHeight', printer.PrintSettings.LiftingHeight], (v: string | any) => printer.PrintSettings.LiftingHeight = v)}
					{gridItem(['LiftingSpeed', printer.PrintSettings.LiftingSpeed], (v: string | any) => printer.PrintSettings.LiftingSpeed = v)}
					{gridItem(['DelayTime', printer.PrintSettings.DelayTime], (v: string | any) => printer.PrintSettings.DelayTime = v)}
					{gridItem(['BottomLayers', printer.PrintSettings.BottomLayers], (v: string | any) => printer.PrintSettings.BottomLayers = v)}
					{gridItem(['BottomExposureTime', printer.PrintSettings.BottomExposureTime], (v: string | any) => printer.PrintSettings.BottomExposureTime = v)}
					{gridItem(['BottomLiftingHeight', printer.PrintSettings.BottomLiftingHeight], (v: string | any) => printer.PrintSettings.BottomLiftingHeight = v)}
					<Grid item  xs={12}>
						<Typography variant='body2' alignSelf={'start'}>
              File export format
						</Typography>
					</Grid>
					{gridItem(['FileExportFormatEncoder', printer.Export.Encoder], (v: string | any) => printer.Export.Encoder = v)}
					{gridItem(['FileExportFormatExt', printer.Export.Extencion], (v: string | any) => printer.Export.Extencion = v)}
				</Grid>
				<Box onClick={close} sx={{
					width: 'fit-content',
					height: 'fit-content',
					pl: 1, pr: 1, marginTop: 1,
					backgroundColor: '#5f9333',
					display: 'flex',
					alignSelf: 'start',
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: '4px',
					border: '1px solid ' + colors.background.dark,
					userSelect: 'none',
					':hover': {
						backgroundColor: '#6fad39',
					}
				}}>
					<Typography variant='body2'>
            Apply and close
					</Typography>
				</Box>
			</Box>
		</Grow>
	</Box>;
});

const Description = (name: string) => {
	switch (name)
	{
		case 'Name':
			return {
				name: 'Name',
				type: 'string'
			};

		case 'ResolutionX':
			return {
				name: 'X',
				description: 'Printer resolution by X',
				type: 'int',
				textend: 'unit'
			};
		case 'ResolutionY':
			return {
				name: 'Y',
				description: 'Printer resolution by Y',
				type: 'int',
				textend: 'unit'
			};
		case 'WorkspaceX':
			return {
				name: 'X',
				description: 'Printer workspace size by X',
				type: 'float',
				textend: 'cm'
			};
		case 'WorkspaceY':
			return {
				name: 'Y',
				description: 'Printer workspace size by Y',
				type: 'float',
				textend: 'cm'
			};
		case 'WorkspaceZ':
			return {
				name: 'Height',
				description: 'Printer workspace size by height',
				type: 'float',
				textend: 'cm'
			};
		case 'LayerHeight':
			return {
				name: 'Layer height',
				description: 'Layer thickness of sliced model',
				type: 'float',
				textend: 'cm',
				minNumber: config.scene.sharpness,
				maxNumber: 50
			};

		case 'BottomLayers':
			return {
				name: 'Bottom layers count',
				description: 'Bottom layers count with longest exposure time',
				type: 'int',
				textend: 'unit',
				minNumber: 0,
				maxNumber: 500
			};

		case 'ExposureTime':
			return {
				name: 'Exposure time',
				description: 'Exposure time for normal layer',
				type: 'float',
				textend: 'seconds',
				minNumber: config.scene.sharpness,
				maxNumber: 10000
			};

		case 'ExposureIndent':
			return {
				name: 'Exposure indent',
				description: 'Indent from the edges of the model in pixels for a longer exposure. Longer exposure increases the rigidity of the model.',
				type: 'int',
				textend: 'pixel',
				minNumber: 0,
				maxNumber: 50
			};

		case 'BottomExposureTime':
			return {
				name: 'Bottom exposure time',
				description: 'Exposure time for bottom layer',
				type: 'float',
				textend: 'seconds',
				minNumber: config.scene.sharpness,
				maxNumber: 10000
			};

		case 'LiftingHeight':
			return {
				name: 'Lifting height',
				description: 'Lifting distance of the print platform after exposure normal layer.',
				type: 'float',
				textend: 'cm',
				minNumber: config.scene.sharpness,
			};

		case 'BottomLiftingHeight':
			return {
				name: 'Bottom lifting height',
				description: 'Lifting distance of the print platform after exposure bottom layer.',
				type: 'float',
				textend: 'cm',
				minNumber: config.scene.sharpness,
			};

		case 'LiftingSpeed':
			return {
				name: 'Moving speed',
				description: 'Print platform moving speed',
				type: 'float',
				textend: 'cm/min',
				minNumber: config.scene.sharpness,
			};

		case 'DelayTime':
			return {
				name: 'Delay time',
				description: 'Delay after raising the print platform',
				type: 'float',
				textend: 'seconds',
				minNumber:  0,
				maxNumber: 10000
			};

		case 'FileExportFormatEncoder':
			return {
				name: 'Encoder',
				type: 'string',
				description: 'Please, check our github main page. Paragraph "Known formats"'
			};

		case 'FileExportFormatExt':
			return {
				name: 'Extencion',
				type: 'string',
				description: 'Please, check our github main page. Paragraph "Known formats"'
			};

		default:
			return {
				name: 'Unknown',
				type: 'string'
			} as DescriptionRow;
	}
};

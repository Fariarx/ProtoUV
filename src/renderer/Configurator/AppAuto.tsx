import { Autocomplete, IconButton, InputAdornment, Link, TextField } from '@mui/material';
import { MdNavigateNext } from '@react-icons/all-files/md/MdNavigateNext';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { AppStore, Log, Pages } from '../AppStore';
import { Printer } from '../Main/Printer/Configs/Printer';
import { config, saveConfig } from '../Shared/Config';
import { colors } from '../Shared/Config';
import { FlexBoxColumn, FlexBoxColumnFit, flexChildrenCenter } from '../Shared/Styled/FlexBox';
import { Sizes } from '../Shared/Styled/Sizes';

export const ConfiguratorAutoApp = observer(() => {
	const configs = Printer.ParseConfigFileNames();
	const [hasFocus, setterFocus] = useState(true);
	const [printerName, setterPrinterName] = useState('');

	const isValidPrinter = () => {
		const result = configs?.default.includes(printerName) || configs?.changed.includes(printerName);

		if (result)
		{
			AppStore.instance.tempPrinter = Printer.LoadConfigFromFile(printerName) ?? undefined;
		}

		return result;
	};

	const save = () => {
		const printer = Printer.LoadConfigFromFile(printerName);
		if (!printer)
		{
			Log('Config parse error');
		}
		else {
			AppStore.sceneStore.printer = printer;
			AppStore.sceneStore.printerName = printer.Name;
			config.printerName = printer.Name;
			AppStore.changeState(Pages.Main);
			saveConfig();
		}
	};

	return <FlexBoxColumn>
		<FlexBoxColumn sx={{
			width: 'unset',
			height: 'unset',
			flexGrow: 1,
			...flexChildrenCenter
		}}>
			<FlexBoxColumnFit sx={{
				width:'60%',
				maxWidth: '600px',
				padding: Sizes.sixteen,
				borderRadius: Sizes.eight,
				marginBottom: Sizes.twentyFour,
			}}>
				<Autocomplete
					options={[...configs.default, ...configs.changed.map(x => x)].filter(function(elem, index, self) {
						return index === self.indexOf(elem);
					})}
					onInputChange={(_, x) => setterPrinterName(x)}
					sx={{
						width: '100%',
						borderRadius: Sizes.eight
					}}
					renderInput={(params) => {
						return (
							<TextField
								{...params}
								autoFocus
								onFocus={() => setterFocus(true)}
								onBlur={() => setterFocus(false)}
								error={!isValidPrinter() && !hasFocus}
								helperText={<>
                  Please select your printer or{' '}
									<Link sx={{ cursor: 'pointer' }} onClick={() =>
										AppStore.changeState(Pages.ConfiguratorManually)
									}>
                    create a new configuration
									</Link>
								</>}
								InputProps={{
									style: {
										padding: Sizes.eight,
										paddingRight: 0
									},
									...params.InputProps,
									endAdornment: (
										<InputAdornment position={'start'}>
											{isValidPrinter() && <IconButton onClick={save}>
												<MdNavigateNext color={colors.background.white}/>
											</IconButton>}
										</InputAdornment>
									)
								}}
								label="Your printer model is ..."
							/>
						);
					}}
				/>
			</FlexBoxColumnFit>
		</FlexBoxColumn>
	</FlexBoxColumn>;
});


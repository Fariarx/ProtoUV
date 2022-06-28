import { Autocomplete, IconButton, InputAdornment, Link, TextField } from '@mui/material';
import { MdNavigateNext } from '@react-icons/all-files/md/MdNavigateNext';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { AppStore, Pages } from '../../../AppStore';
import { HeaderApp } from '../../../HeaderApp';
import { colors } from '../../../Shared/Colors';
import { FlexBoxColumn, FlexBoxColumnFit, flexChildrenCenter } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { Printer } from '../Configs/Printer';

export const AutoConfiguratorApp = observer(() => {
	const configs = Printer.ParseConfigFileNames();
	const [hasFocus, setterFocus] = useState(true);
	const [printer, setterPrinter] = useState('');
	const isValidPrinter = () => configs.includes(printer);

	return <FlexBoxColumn>
		<HeaderApp />
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
					options={configs}
					onInputChange={(_, x) => setterPrinter(x)}
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
									<Link sx={{ cursor: 'pointer' }} onClick={() => AppStore.instance.state = Pages.ConfiguratorManually}>
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
											{isValidPrinter() && <IconButton>
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

import { Box, Grid, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { colors } from 'renderer/Shared/Config';
import { FlexBoxColumnFit } from 'renderer/Shared/Styled/FlexBox';
import { Sizes } from 'renderer/Shared/Styled/Sizes';

export const GridFields = (props: {obj: any, name: string}) => <FlexBoxColumnFit sx={{
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
			.map((x: [string, unknown]) => x[0] === 'Name' ? <Box/> :<Grid key={x[0]} item xs={3}>
				<NumberField {...props} pair={x}/>
			</Grid>)}
	</Grid>
</FlexBoxColumnFit>;

export const NameField = (props: {text: string, setText: (str: string) => void}) => {
	const [error, setterError] = useState(false);

	return <FlexBoxColumnFit sx={{
		width: '100%',
		maxWidth: '1000px',
		height: 'unset'
	}}>
		<TextField autoFocus
			variant="filled"
			error={error}
			defaultValue={props.text}
			label={'Configuration name'}
			sx={{ width: '70%' }}
			onChange={(y) => {
				if (y.currentTarget.value && y.currentTarget.value.length > 3 && y.currentTarget.value.length < 128)
				{
					props.setText(y.currentTarget.value);
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

export const NumberField = (props: {obj: any, name: string, pair: [string, unknown]}) => {
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

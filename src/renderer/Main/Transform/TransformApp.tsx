import {
	Divider,
	Paper, ToggleButton,
	ToggleButtonGroup, styled
} from '@mui/material';
import React from 'react';
import { Margins } from '../../Shared/Styled/Margins';

export const TransformApp = () => {
	const [alignment, setAlignment] = React.useState('left');
	const [formats, setFormats] = React.useState(() => ['italic']);

	const handleFormat = (
		_: React.MouseEvent<HTMLElement>,
		newFormats: string[],
	) => {
		setFormats(newFormats);
	};

	const handleAlignment = (
		_: React.MouseEvent<HTMLElement>,
		newAlignment: string,
	) => {
		setAlignment(newAlignment);
	};

	return  <Paper
		elevation={0}
		sx={{
			display: 'flex',
			border: (theme) => `1px solid ${theme.palette.divider}`,
			flexWrap: 'wrap',
			position: 'absolute',
			top: Margins._4
		}}
	>
		<StyledToggleButtonGroup
			size="small"
			value={alignment}
			exclusive
			onChange={handleAlignment}
			aria-label="text alignment"
		>
			<ToggleButton value="left" aria-label="left aligned">
			</ToggleButton>
			<ToggleButton value="center" aria-label="centered">
			</ToggleButton>
			<ToggleButton value="right" aria-label="right aligned">
			</ToggleButton>
			<ToggleButton value="justify" aria-label="justified" disabled>
			</ToggleButton>
		</StyledToggleButtonGroup>
		<Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
		<StyledToggleButtonGroup
			size="small"
			value={formats}
			onChange={handleFormat}
			aria-label="text formatting"
		>
			<ToggleButton value="bold" aria-label="bold">
			</ToggleButton>
			<ToggleButton value="italic" aria-label="italic">
			</ToggleButton>
			<ToggleButton value="underlined" aria-label="underlined">
			</ToggleButton>
			<ToggleButton value="color" aria-label="color" disabled>
			</ToggleButton>
		</StyledToggleButtonGroup>
	</Paper>;
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
	'& .MuiToggleButtonGroup-grouped': {
		margin: theme.spacing(0.5),
		border: 0,
		'&.Mui-disabled': {
			border: 0,
		},
		'&:not(:first-of-type)': {
			borderRadius: theme.shape.borderRadius,
		},
		'&:first-of-type': {
			borderRadius: theme.shape.borderRadius,
		},
	},
}));

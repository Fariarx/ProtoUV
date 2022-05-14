import {
	Paper, ToggleButton,
	ToggleButtonGroup,
} from '@mui/material';
import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import React from 'react';
import { APP_HEADER_HEIGHT } from '../../Header';
import { colors } from '../../Shared/Colors';
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
		elevation={12}
		variant="outlined"
		sx={{
			display: 'flex',
			flexWrap: 'wrap',
			position: 'absolute',
			top: '20%',
			left: Margins.twelve
		}}
	>
		<ToggleButtonGroup
			size="medium"
			value={alignment}
			exclusive
			orientation="vertical"
			onChange={handleAlignment}
			aria-label="Instrument window"
			sx={{
				backgroundColor: colors.instruments.main,
			}}
		>
			<ToggleButton value="left" aria-label="left aligned">
				<BsArrowsMove transform={'scale(1.5)'}/>
			</ToggleButton>
			<ToggleButton value="center" aria-label="centered">
				<Md3DRotation transform={'scale(1.5)'}/>
			</ToggleButton>
			<ToggleButton value="right" aria-label="right aligned">
				<FiCode transform={'scale(1.5)'}/>
			</ToggleButton>
		</ToggleButtonGroup>
	</Paper>;
};

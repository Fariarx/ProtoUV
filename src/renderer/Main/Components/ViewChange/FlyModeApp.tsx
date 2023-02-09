import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { IoIosAirplane } from '@react-icons/all-files/io/IoIosAirplane';
import { IoAirplaneOutline } from '@react-icons/all-files/io5/IoAirplaneOutline';
import { observer } from 'mobx-react';
import { AppStore } from '../../../AppStore';
import { colors } from '../../../Shared/Config';

export const FlyModeDescriptionApp = observer(() => {
	if (!AppStore.sceneStore.controlsTypeFlyEnabled)
	{
		return <Box/>;
	}

	return <Box sx={{
		position: 'fixed',
		top: 40,
		left:100
	}}>
		<Typography variant={'caption'}>fly controls <b>Tab</b> switch controls mode<br/>
			<b>WASD</b> move, <b>R|F</b> up | down, <b>Q|E</b> roll, <b>up|down</b> pitch, <b>left|right</b> yaw</Typography>
	</Box>;
});

export const FlyModeApp = observer(() => {
	return <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{'fly mode\ntab to change mode'}</span>} arrow placement="bottom" PopperProps={{
		sx: {
			userSelect: 'none',
		}
	}}>
		<IconButton
			size='small'
			onClick={() => {
				AppStore.sceneStore.controlsTypeFlyEnabled = !AppStore.sceneStore.controlsTypeFlyEnabled;
			}}>
			{AppStore.sceneStore.controlsTypeFlyEnabled
				? <IoIosAirplane color={colors.background.light}/>
				: <IoAirplaneOutline color={colors.background.light}/>}
		</IconButton>
	</Tooltip>;
});

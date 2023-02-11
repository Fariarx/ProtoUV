import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { AppStore } from '../../../AppStore';

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

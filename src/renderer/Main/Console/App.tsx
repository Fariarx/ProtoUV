import { Box, Fade, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { colors } from '../../Shared/Colors';
import { Log } from './Store';

export const ConsoleApp = observer(()=> {
	return <Fade in={Log.isVisible}>
		<Box sx={{
			width:'60%',
			height:'15%',
			position: 'fixed',
			bottom: 0,
			overflow: 'hidden',
			color: colors.typography.background,
			margin: '12px'
		}}>
			{Log.list.map(x => <Typography key={x.time} variant={'body2'}>
				{x.time} {'>'} {x.text}
			</Typography>)}
		</Box>
	</Fade>;
});

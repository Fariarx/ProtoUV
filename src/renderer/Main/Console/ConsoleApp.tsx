import { Box, Fade, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { AppStore } from '../../AppStore';
import { colors } from '../../Shared/Colors';
import { Margins } from '../../Shared/Styled/Margins';

export const ConsoleApp = observer(()=> {

	return <Fade in={AppStore.log.isVisible}>
		<Box sx={{
			width:'60%',
			height:'15%',
			position: 'fixed',
			bottom: 0,
			overflow: 'hidden',
			color: colors.typography.background,
			margin: Margins.twelve,
			fontVariant: 'unicase'
		}}>
			{AppStore.log.list.map(x => <Typography key={x.time} variant={'body2'}>
				{x.time} {'>'} {x.text}
			</Typography>)}
		</Box>
	</Fade>;
});

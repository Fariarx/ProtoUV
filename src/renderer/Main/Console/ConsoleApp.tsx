import { Box, Fade, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { colors } from '../../Shared/Colors';
import { linearGenerator } from '../../Shared/Libs/Tools';
import { Sizes } from '../../Shared/Styled/Sizes';
import { AppStore } from '../AppStore';

export const ConsoleApp = observer((props: { marginLeft: string })=> {

	return <Fade in={AppStore.log.isVisible}>
		<Box sx={{
			width:'60%',
			height: 'fit-content',
			maxHeight:'15%',
			position: 'fixed',
			bottom: 0,
			overflow: 'hidden',
			color: colors.typography.background,
			margin: Sizes.twelve,
			marginLeft: props.marginLeft,
			fontVariant: 'unicase'
		}}>
			{AppStore.log.list.map(x => <Typography key={linearGenerator.next().value} variant={'body2'}>
				{x.time} {'>'} {x.text}
			</Typography>)}
		</Box>
	</Fade>;
});

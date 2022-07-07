import { Box, Fade, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { AppStore } from '../../AppStore';
import { linearGenerator } from '../../Shared/Libs/Tools';
import { Sizes } from '../../Shared/Styled/Sizes';
import { colors } from '../../Shared/Theme';

export const ConsoleApp = observer((props: {mt?: string, mb?: string}) => {

	return <Fade in={AppStore.console.isVisible}>
		<Box sx={{
			width:'60%',
			height: 'fit-content',
			maxHeight:'15%',
			position: 'fixed',
			bottom: 0,
			overflow: 'hidden',
			color: colors.typography.background,
			margin: Sizes.twelve,
			marginLeft: Sizes.twelve,
			marginBottom: Sizes.sum(Sizes.twentyFour, Sizes.eight),
			fontVariant: 'unicase',
			...props
		}}>
			{AppStore.console.list.map(x => <Typography key={linearGenerator.next().value} variant={'body2'}>
				{x.time} {'>'} {x.text}
			</Typography>)}
		</Box>
	</Fade>;
});

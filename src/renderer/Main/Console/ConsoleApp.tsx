import { Box, Fade, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { AppStore } from '../../AppStore';
import { colors } from '../../Shared/Config';
import { linearGenerator } from '../../Shared/Libs/Tools';
import { Sizes } from '../../Shared/Styled/Sizes';

export const ConsoleApp = observer((props: {mt?: string, mb?: string}) => {
	const [ selectable, setSelectable ] = useState(false);

	// #TODO Добавить окно для клика
	return <Fade in={AppStore.console.isVisible}>
		<Box
			onClick={() => {
				setSelectable(true);
				setTimeout(() => setSelectable(false), 5000);
			}}
			sx={{
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
				userSelect: selectable ? 'unset' : 'none',
				pointerEvents: selectable ? 'unset' : 'none',
				...props
			}}>
			{AppStore.console.list.slice().reverse().map(x => <Typography key={linearGenerator.next().value} variant={'body2'}>
				{x.time} {'>'} {x.text}
			</Typography>)}
		</Box>
	</Fade>;
});

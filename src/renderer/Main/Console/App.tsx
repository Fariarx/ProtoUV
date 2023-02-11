import { Box, Fade, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { ConsoleColors } from './Store';
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
				margin: Sizes.twelve,
				marginLeft: Sizes.twelve,
				marginBottom: Sizes.sum(Sizes.twentyFour, Sizes.eight),
				fontVariant: 'unicase',
				userSelect: selectable ? 'unset' : 'none',
				pointerEvents: selectable ? 'unset' : 'none',
				...props
			}}>
			{AppStore.console.list.slice().reverse().map(x => {
				let color;

				switch (x.color) {
					case ConsoleColors.Message:
						color = colors.background.light;
						break;
					case ConsoleColors.Success:
						color = colors.interact.success;
						break;
					case ConsoleColors.Error:
						color = colors.interact.danger;
						break;
				}

				return <Typography key={linearGenerator.next().value} variant={'body2'} sx={{
					color: colors.background.light,
					textShadow: '0px 0px 4px #2C130C',
					...(x.color === ConsoleColors.Message ? {} : {
						color,
						fontWeight: 0
					}),
					'-webkit-font-smoothing': 'antialiased'
				}}>
					{x.time} {'>'} {x.text}
				</Typography>;
			})}
		</Box>
	</Fade>;
});

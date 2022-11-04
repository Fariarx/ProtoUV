import { Stack, Typography } from '@mui/material';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { container } from 'tsyringe';
import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { colors } from '../../../Shared/Config';
import { SubscribersMouseMove, SubscribersMouseUp } from '../../../Shared/Libs/Listerners';
import { FlexBox, FlexBoxColumn, FlexBoxRow } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { ToolsTabStore } from './ToolsTabStore';

export const ToolsTabApp = observer(() => {
	const store = container.resolve(ToolsTabStore);

	useEffect(() => {
		SubscribersMouseMove.push((e) => {
			runInAction(() => {
				if (store.resize) {
					const width = (1 - (e.clientX / window.innerWidth)) * window.innerWidth;
					if (width > 0)
					{
						store.width = width - 4;
					}
				}
			});
		});
		SubscribersMouseUp.push(() => {
			store.resize = false;
		});
	}, []);

	return <FlexBoxRow
		sx={{
			width: store.width + 'px',
			maxWidth: '400px',
			minWidth: '200px',
			height: '400px',
			background: colors.background.heavy,
			border: '1px solid ' + colors.background.darkest,
			position: 'absolute',
			right: Sizes.eight,
			top: Sizes.sum(APP_HEADER_HEIGHT_PX, Sizes.eight),
			borderRadius: Sizes.eight,
			padding: Sizes.four,
			paddingLeft: 0
		}}>

		<FlexBoxColumn
			onMouseDown={() => {
				store.resize = true;
			}}
			sx={{
				width: '5px',
				transition: '0.5s ease-out',
				cursor: 'col-resize',
				':hover': {
					backgroundColor: colors.interact.touch,
					width: Sizes.eight
				}
			}}>

		</FlexBoxColumn>

		<FlexBoxColumn>
			<FlexBoxRow sx={{
				width: '100%',
				height: '200px',
				backgroundColor: colors.background.dark,
				borderRadius: Sizes.four,
				border: '1px solid ' + colors.background.darkest
			}}>

			</FlexBoxRow>
			<Stack mt={Sizes.four} spacing={Sizes.four} direction='row'>
				<FlexBox sx={{
					width: 'fit-content',
					height: 'fit-content',
					pl: Sizes.eight, pr: Sizes.eight,
					backgroundColor: colors.background.common,
					borderRadius: Sizes.four,
					border: '1px solid ' + colors.background.darkest,
					userSelect: 'none',
					transition: '0.2s ease-out',
					':hover': {
						backgroundColor: colors.interact.neutral1,
						border: '1px solid ' + colors.interact.touch,
					},
					':active': {
						backgroundColor: colors.interact.touch1,
					}
				}}>
					<Typography variant='caption' color={colors.background.light}>
            Select all
					</Typography>
				</FlexBox>
				<FlexBox sx={{
					width: 'fit-content',
					height: 'fit-content',
					pl: Sizes.eight, pr: Sizes.eight,
					backgroundColor: colors.background.common,
					borderRadius: Sizes.four,
					border: '1px solid ' + colors.background.darkest,
					userSelect: 'none',
					transition: '0.2s ease-out',
					':hover': {
						backgroundColor: colors.interact.neutral1,
						border: '1px solid ' + colors.interact.touch,
					},
					':active': {
						backgroundColor: colors.interact.touch1,
					}
				}}>
					<Typography variant='caption' color={colors.background.light}>
            Clear select
					</Typography>
				</FlexBox>
			</Stack>
		</FlexBoxColumn>
	</FlexBoxRow>;
});

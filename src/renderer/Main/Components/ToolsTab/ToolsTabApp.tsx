import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { container } from 'tsyringe';
import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { colors } from '../../../Shared/Config';
import { SubscribersMouseDown, SubscribersMouseMove, SubscribersMouseUp } from '../../../Shared/Libs/Listerners';
import { FlexBoxColumn, FlexBoxRow } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { ToolsTabStore } from './ToolsTabStore';

export const ToolsTabApp = observer(() => {
	const store = container.resolve(ToolsTabStore);

	useEffect(() => {
		SubscribersMouseMove.push((e) => {
			runInAction(() => {
				if (store.resize) {
					const width = (1 - (e.clientX / window.innerWidth)) * window.innerWidth;
					store.width = width - 4;
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
			background: colors.background.dark,
			border: '1px solid ' + colors.background.commonest,
			position: 'absolute',
			right: Sizes.eight,
			top: Sizes.sum(APP_HEADER_HEIGHT_PX, Sizes.eight),
			borderRadius: Sizes.four
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
	</FlexBoxRow>;
});

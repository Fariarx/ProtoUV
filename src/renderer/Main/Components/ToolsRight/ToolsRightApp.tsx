import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { AppStore } from 'renderer/AppStore';
import { APP_BOTTOM_HEIGHT_PX } from 'renderer/BottomApp';
import { container } from 'tsyringe';
import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { colors, config, saveConfig } from '../../../Shared/Config';
import { SubscribersMouseMove, SubscribersMouseUp } from '../../../Shared/Libs/Listerners';
import { FlexBoxColumn, FlexBoxRow} from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { ListObjects } from './ListObjectsApp';
import { PrinterApp } from './PrinterApp';
import { PerformSupportsApp } from './Supports/PerformSupportsApp';
import { ToolsRightStore } from './ToolsRightStore';

export const TOOLS_TAB_MIN_SIZE = 150;
export const TOOLS_TAB_MAX_SIZE = 400;

export const ToolsRightApp = observer(() => {
	const store = container.resolve(ToolsRightStore);

	useEffect(() => {
		SubscribersMouseMove.push((e) => {
			runInAction(() => {
				if (store.resize) {
					let width = (1 - (e.clientX / window.innerWidth)) * window.innerWidth;
					if (width < TOOLS_TAB_MIN_SIZE)
					{
						width = TOOLS_TAB_MIN_SIZE;
					}
					if (width > TOOLS_TAB_MAX_SIZE)
					{
						width = TOOLS_TAB_MAX_SIZE;
					}

					store.width = width - 4;
					AppStore.sceneStore.updateOrientationHelper();
				}
			});
		});
		SubscribersMouseUp.push(() => {
			runInAction(() => {
				store.resize = false;
				config.ui.sizes.toolsTab = store.width;
				saveConfig();
			});
		});
	}, []);

	return <FlexBoxRow
		sx={{
			width: store.width + 'px',
			height: 'fit-content',
			opacity: config.ui.opacity,
			position: 'absolute',
			top: APP_HEADER_HEIGHT_PX,
			bottom: APP_BOTTOM_HEIGHT_PX,
			pointerEvents: 'none',
			right: 0,
		}}>
		<ResizePanel store={store} />
		<FlexBoxColumn sx={{
			pointerEvents: 'auto',
		}}>
			<PrinterApp/>
			<ListObjects/>
			<PerformSupportsApp/>
		</FlexBoxColumn>
	</FlexBoxRow>;
});

const ResizePanel = (props: { store: ToolsRightStore }) => {
	return <FlexBoxColumn
		onMouseDown={() => {
			props.store.resize = true;
		}}
		sx={{
			pointerEvents: 'auto',
			marginLeft: Sizes.negative(Sizes.four),
			width: '6px',
			transition: '0.5s ease-out',
			cursor: 'col-resize',
			position: 'absolute',
			userSelect: 'none',
			':hover': {
				backgroundColor: colors.interact.touch,
				width: Sizes.eight
			}
		}}/>;
};

import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { AppStore } from 'renderer/AppStore';
import { container } from 'tsyringe';
import { ListObjects } from './ListObjects';
import { PrinterPanel } from './PrinterPanel';
import { ToolsRightStore } from './Store';
import { App } from './Supports/App';
import { APP_BOTTOM_HEIGHT_PX } from '../../../Screen/Bottom/App';
import { APP_HEADER_HEIGHT_PX } from '../../../Screen/Header/App';
import { colors, config, saveConfig } from '../../../Shared/Config';
import { SubscribersMouseMove, SubscribersMouseUp } from '../../../Shared/Libs/Listerners';
import { FlexBoxColumn, FlexBoxRow } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { SliceButton } from '../Slice/SliceButton';

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
			<PrinterPanel/>
			<ListObjects/>
			<App/>
			<SliceButton/>
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
			width: '5px',
			marginTop: '8px',
			borderRadius: '3px',
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

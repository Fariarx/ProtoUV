import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { RiCheckboxIndeterminateLine } from '@react-icons/all-files/ri/RiCheckboxIndeterminateLine';
import { RiCheckboxLine } from '@react-icons/all-files/ri/RiCheckboxLine';
import { RiDeleteBinLine } from '@react-icons/all-files/ri/RiDeleteBinLine';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import {  ReactChild, useEffect } from 'react';
import { AppStore } from 'renderer/AppStore';
import { APP_BOTTOM_HEIGHT_PX } from 'renderer/BottomApp';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { isKeyPressed } from 'renderer/Shared/Libs/Keys';
import { Key } from 'ts-keycode-enum';
import { container } from 'tsyringe';
import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { colors, config, saveConfig } from '../../../Shared/Config';
import { SubscribersMouseMove, SubscribersMouseUp } from '../../../Shared/Libs/Listerners';
import { FlexBox, FlexBoxColumn, FlexBoxRow, RisizibleFlexBox, flexChildrenCenter, flexSelfCenter } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
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
			height: `calc(100% - ${APP_HEADER_HEIGHT_PX} - ${APP_BOTTOM_HEIGHT_PX})`,
			opacity: config.ui.opacity,
			position: 'absolute',
			top: APP_HEADER_HEIGHT_PX,
			bottom: APP_BOTTOM_HEIGHT_PX,
			right: 0
		}}>
		<ResizePanel store={store} />
		<FlexBoxColumn>
			<SceneItems/>
			<Stack direction='row' sx={{
				p: Sizes.four,
				backgroundColor: colors.background.heavy,
				flexWrap: 'wrap',
				borderRadius: '0 0 0 4px',
				borderLeft: '1px solid ' + colors.background.black,
				borderBottom: '1px solid ' + colors.background.black
			}}>
				<Button text='Select all' action={() => SceneObject.SelectAllObjects()} icon={<RiCheckboxLine color={colors.background.light}/>}/>
				<Button text='Clear select' action={() => SceneObject.DeselectAllObjects()} icon={<RiCheckboxIndeterminateLine color={colors.background.light}/>}/>
				<Button text='Delete' action={() => SceneObject.SelectObjsDelete()} icon={<RiDeleteBinLine color={colors.background.light}/>}/>
			</Stack>
		</FlexBoxColumn>
	</FlexBoxRow>;
});

const SceneItems = observer(() => {
	return <RisizibleFlexBox flexBoxProps={{
		sx: {
			width: '100%',
			minHeight: '150px',
			maxHeight: '40%',
			height: config.ui.sizes.sceneItemList + 'px',
			backgroundColor: colors.background.dark,
			marginTop: '8px',
			borderTop: '1px solid ' + colors.background.black,
			borderLeft: '1px solid ' + colors.background.black,
			borderBottom: '1px solid ' + colors.background.darkest,
			borderRadius: '4px  0 0 0',
			resize: 'vertical',
			flexDirection: 'column',
			overflow: 'auto'
		}
	}} onResize={(_, h) => {
		config.ui.sizes.sceneItemList = h;
		saveConfig();
	}}>
		{/* {AppStore.sceneStore.objects.length === 0 && <FlexBoxRow sx={{
			textOverflow: 'ellipsis',
			width: '-webkit-fill-available',
			height: Sizes.twentyFour,
			pr: Sizes.four,
			m: Sizes.four, mb: 0,
			userSelect: 'none',
			borderRadius: Sizes.two,
			placeContent: 'center',
		}}>
			<Typography variant='caption' color={colors.background.light} sx={{
				...flexSelfCenter,
				whiteSpace: 'nowrap',
				marginTop: '1px'
			}}>
					_______ Empty _______
			</Typography>
		</FlexBoxRow>} */}
		{AppStore.sceneStore.objects.map((x, key) => {
			return <FlexBoxRow key={key} sx={{
				textOverflow: 'ellipsis',
				width: '-webkit-fill-available',
				height: Sizes.twentyFour,
				backgroundColor: x.isSelected
					? colors.background.commonest
					: 'unset',
				pr: Sizes.four,
				m: Sizes.four, mb: 0,
				userSelect: 'none',
				borderRadius: Sizes.two,
				transition: '0.4s all',
			}} onClick={() => {
				if (!isKeyPressed(Key.Shift) && !isKeyPressed(Key.Ctrl))
				{
					SceneObject.DeselectAllObjects();
				}
				x.isSelected = !x.isSelected;
				AppStore.sceneStore.updateSelectionChanged();
			}}>
				<FlexBoxRow sx={{
					padding: Sizes.four,
					width: Sizes.twentyFour,
					height: Sizes.twentyFour,
					...flexChildrenCenter
				}}>
					<FlexBox sx={{
						border: '1px solid ' + colors.background.darkest,
						backgroundColor: x.isSelected ? colors.interact.touch : colors.interact.warning,
						borderRadius: '100%',
						width: x.isSelected ? Sizes.twelve : Sizes.eight,
						height: x.isSelected ? Sizes.twelve : Sizes.eight,
						transition: '0.4s all',
					}}>

					</FlexBox>
				</FlexBoxRow>
				<Typography color={colors.background.light} sx={{
					...flexSelfCenter,
					whiteSpace: 'nowrap',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					marginTop: '1px',
					fontSize: '11px'
				}}>
					{key + ' : ' + x.name}
				</Typography>
			</FlexBoxRow>;
		})}
	</RisizibleFlexBox>;
});

const Button = (props: {
  text: string;
  action: () => void;
  icon: ReactChild;
}) => {
	return <Tooltip title={props.text} arrow placement="bottom"
		PopperProps={{ sx: { userSelect: 'none' } }}>
		<IconButton size='small' aria-label={props.text} onClick={props.action}>
			{props.icon}
		</IconButton>
	</Tooltip>;
};

const ResizePanel = (props: { store: ToolsRightStore }) => {
	return <FlexBoxColumn
		onMouseDown={() => {
			props.store.resize = true;
		}}
		sx={{
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

import { Box,  Stack, Typography } from '@mui/material';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import {  useEffect } from 'react';
import { AppStore } from 'renderer/AppStore';
import { APP_BOTTOM_HEIGHT_PX } from 'renderer/BottomApp';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { isKeyPressed } from 'renderer/Shared/Libs/Keys';
import { Key } from 'ts-keycode-enum';
import { container } from 'tsyringe';
import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { colors, config, saveConfig } from '../../../Shared/Config';
import { SubscribersMouseMove, SubscribersMouseUp } from '../../../Shared/Libs/Listerners';
import { FlexBox, FlexBoxColumn, FlexBoxRow, FlexBoxRowFit, RisizibleFlexBox, flexChildrenCenter, flexSelfCenter } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { ToolsTabStore } from './ToolsTabStore';

export const TOOLS_TAB_MIN_SIZE = 200;
export const TOOLS_TAB_MAX_SIZE = 400;

export const ToolsTabApp = observer(() => {
	const store = container.resolve(ToolsTabStore);

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
			background: colors.background.heavy,
			borderLeft: '1px solid ' + colors.background.darkest,
			position: 'absolute',
			top: APP_HEADER_HEIGHT_PX,
			bottom: APP_BOTTOM_HEIGHT_PX,
			right: 0,
			padding: Sizes.four
		}}>
		<ResizePanel store={store} />
		<FlexBoxColumn>
			<SceneItems/>
			<Stack direction='row' sx={{
				flexWrap: 'wrap'
			}}>
				<Button text='Select all' action={() => SceneObject.SelectAllObjects()}/>
				<Button text='Clear select' action={() => SceneObject.DeselectAllObjects()}/>
				<Button text='Delete' action={() => SceneObject.SelectObjsDelete()}/>
			</Stack>
		</FlexBoxColumn>
	</FlexBoxRow>;
});

const Transform = () => {
	return <Stack spacing={Sizes.four} mb={Sizes.four} sx={{
		padding: Sizes.four,
		backgroundColor: colors.background.dark
	}}>
		<FlexBoxRowFit sx={{
			border: '2px solid ' + colors.interact.warning,
			borderRadius: Sizes.four,
			overflow: 'hidden',
		}}>
			<TransformEdit color={colors.scene.x} text='X' textEnd='cm'/>
			<TransformEdit color={colors.scene.y} text='Y' textEnd='cm' margin/>
			<TransformEdit color={colors.scene.z} text='Z' textEnd='cm' margin/>
		</FlexBoxRowFit>
		<FlexBoxRowFit>
			<TransformEdit color={colors.scene.x} text='X' textEnd='°'/>
			<TransformEdit color={colors.scene.y} text='Y' textEnd='°' margin/>
			<TransformEdit color={colors.scene.z} text='Z' textEnd='°' margin/>
		</FlexBoxRowFit>
		<FlexBoxRowFit>
			<TransformEdit color={colors.scene.x} text='X' textEnd='%'/>
			<TransformEdit color={colors.scene.y} text='Y' textEnd='%' margin/>
			<TransformEdit color={colors.scene.z} text='Z' textEnd='%' margin/>
		</FlexBoxRowFit>
	</Stack>;
};

const TransformEdit = (props: { margin?:boolean, color:string, text: string, textEnd: string }) => {
	return <FlexBoxRow sx={{
		backgroundColor: colors.background.heavy,
		flexGrow: 1,
		height: Sizes.sum(Sizes.sixteen, Sizes.four),
		marginLeft: props.margin ? Sizes.four : 'unset',
		transition: '500ms all',
		overflow: 'hidden',
	}}>
		<FlexBox sx={{
			width: 'fit-content',
			height: Sizes.sum(Sizes.sixteen, Sizes.four),
			backgroundColor: props.color,
			padding: Sizes.four,
			...flexChildrenCenter
		}}>
			<Typography variant='caption' color={colors.background.light}>
				{props.text}
			</Typography>
		</FlexBox>
		<FlexBox sx={{
			width: '100%',
			height: Sizes.sum(Sizes.sixteen, Sizes.four),
			backgroundColor: colors.background.dark,
			marginLeft: '2px',
		}}>
			<Typography variant='caption' color={colors.background.light}>
				{10.000001}
			</Typography>
		</FlexBox>
	</FlexBoxRow>;
};

const SceneItems = observer(() => {
	return <RisizibleFlexBox flexBoxProps={{
		sx: {
			width: '100%',
			minHeight: '100px',
			maxHeight: '40%',
			height: config.ui.sizes.sceneItemList + 'px',
			backgroundColor: colors.background.dark,
			borderRadius: Sizes.two,
			border: '1px solid ' + colors.background.darkest,
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
					? colors.background.heavy
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
				<Typography variant='caption' color={colors.background.light} sx={{
					...flexSelfCenter,
					whiteSpace: 'nowrap',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					marginTop: '1px'
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
}) => {
	return <FlexBox onClick={props.action} sx={{
		width: 'fit-content',
		height: 'fit-content',
		pl: Sizes.eight, pr: Sizes.eight,
		mr: Sizes.four, mt: Sizes.four,
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
			{props.text}
		</Typography>
	</FlexBox>;
};

const ResizePanel = (props: { store: ToolsTabStore }) => {
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
			':hover': {
				backgroundColor: colors.interact.touch,
				width: Sizes.eight
			}
		}}/>;
};

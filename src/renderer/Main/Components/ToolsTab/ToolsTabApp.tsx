import { Stack, Typography } from '@mui/material';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { AppStore } from 'renderer/AppStore';
import { APP_BOTTOM_HEIGHT_PX } from 'renderer/BottomApp';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { isKeyPressed } from 'renderer/Shared/Libs/Keys';
import { Key } from 'ts-keycode-enum';
import { container } from 'tsyringe';
import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { colors } from '../../../Shared/Config';
import { SubscribersMouseMove, SubscribersMouseUp } from '../../../Shared/Libs/Listerners';
import { FlexBox, FlexBoxColumn, FlexBoxRow, flexChildrenCenter, flexSelfCenter } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { ToolsTabStore } from './ToolsTabStore';

export const ToolsTabApp = observer(() => {
	const store = container.resolve(ToolsTabStore);

	useEffect(() => {
		SubscribersMouseMove.push((e) => {
			runInAction(() => {
				if (store.resize) {
					const width = (1 - (e.clientX / window.innerWidth)) * window.innerWidth;
					if (width >= 0)
					{
						store.width = width - 4;
					}
				}
			});
		});
		SubscribersMouseUp.push(() => {
			runInAction(() => {
				store.resize = false;
			});
		});
	}, []);

	return <FlexBoxRow
		sx={{
			width: store.width + 'px',
			maxWidth: '400px',
			minWidth: '200px',
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

const SceneItems = observer(() => {
	return <FlexBoxColumn sx={{
		width: '100%',
		height: '200px',
		backgroundColor: colors.background.dark,
		borderRadius: Sizes.two,
		boxShadow: 'inset 0px 0px 5px 0px ' + colors.background.darkest,
	}}>
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
				if (!isKeyPressed(Key.Shift))
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
	</FlexBoxColumn>;
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

import { Box, Stack, Typography } from '@mui/material';
import { RiCheckboxIndeterminateLine } from '@react-icons/all-files/ri/RiCheckboxIndeterminateLine';
import { RiCheckboxLine } from '@react-icons/all-files/ri/RiCheckboxLine';
import { RiDeleteBinLine } from '@react-icons/all-files/ri/RiDeleteBinLine';
import { observer } from 'mobx-react-lite';
import { AppStore } from 'renderer/AppStore';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { colors, config, saveConfig } from 'renderer/Shared/Config';
import { isKeyPressed } from 'renderer/Shared/Libs/Keys';
import { FlexBox, FlexBoxRow, RisizibleFlexBox, flexChildrenCenter, flexSelfCenter } from 'renderer/Shared/Styled/FlexBox';
import { Sizes } from 'renderer/Shared/Styled/Sizes';
import { Key } from 'ts-keycode-enum';
import { ToolButton } from './Supports/Shared/ToolButton';

export const ListObjects = observer(() => {

	return <>
		<SceneItems/>
		<Stack direction='row' sx={{
			p: Sizes.eight,
			backgroundColor: colors.background.heavy,
			flexWrap: 'wrap',
			borderRadius: '0 0 0 4px',
			borderLeft: '1px solid ' + colors.background.black,
			borderBottom: '1px solid ' + colors.background.black
		}}>
			<Box sx={{
				display: 'flex',
				gap: 0.5,
			}}>
				<ToolButton
					text='Select all'
					onClick={() => SceneObject.SelectAllObjects()}>
					<RiCheckboxLine color={colors.background.light}/>
				</ToolButton>

				<ToolButton
					text='Clear select'
					onClick={() => SceneObject.DeselectAllObjects()}>
					<RiCheckboxIndeterminateLine color={colors.background.light}/>
				</ToolButton>

				<ToolButton
					text='Delete selected'
					onClick={() => SceneObject.SelectObjsDelete()}>
					<RiDeleteBinLine color={colors.background.light}/>
				</ToolButton>
			</Box>
		</Stack>
	</>;
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

import { Box,Divider,Grow,Input,Popper, Typography } from '@mui/material';
import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { observer } from 'mobx-react';
import { createRef, useState } from 'react';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { SceneStore } from 'renderer/Main/Scene/SceneStore';
import { colors, config } from 'renderer/Shared/Config';
import { Dispatch } from 'renderer/Shared/Events';
import { EnumHelpers } from 'renderer/Shared/Helpers/Enum';
import { flexChildrenCenter } from 'renderer/Shared/Styled/FlexBox';
import { Sizes } from 'renderer/Shared/Styled/Sizes';
import { container } from 'tsyringe';
import { AppEventEnum, TransformEnum } from '../../../Shared/Libs/Types';
import { ToolButtonStyled } from '../ToolsLeft/ToolButtonStyled';
import { TransformStore } from './TransformStore';

const scale = 'scale(1.1)';

export const TransformApp = observer(() => {
	const store = container.resolve(TransformStore);
	const action = (event: any, action: TransformEnum) => {
		store.changeState(action);
		store.anchorElement = store.state !== TransformEnum.None
			? event.currentTarget
			: null;
	};

	return <>
		<ToolButtonStyled description={'move'}
			mini={store.state !== TransformEnum.Move}
			selected={store.state === TransformEnum.Move}
			onClick={e => action(e, TransformEnum.Move)}
			sx={{ borderRadius: store.state === TransformEnum.Move ? '0px 4px 4px 0px' : '0px 2px 0px 0px' }}>
			<BsArrowsMove transform={scale}/>
		</ToolButtonStyled>
		<ToolButtonStyled description={'rotate'}
			mini={store.state !== TransformEnum.Rotate}
			selected={store.state === TransformEnum.Rotate}
			onClick={e => action(e, TransformEnum.Rotate)}
			sx={{ borderRadius: store.state === TransformEnum.Rotate ? '0px 4px 4px 0px' : 'unset' }}>
			<Md3DRotation transform={scale}/>
		</ToolButtonStyled>
		<ToolButtonStyled description={'scale'}
			mini={store.state !== TransformEnum.Scale}
			selected={store.state === TransformEnum.Scale}
			onClick={e => action(e, TransformEnum.Scale)}
			sx={{ borderRadius: store.state === TransformEnum.Scale ? '0px 4px 4px 0px' : '0px 0px 2px 0px' }}>
			<FiCode transform={scale}/>
		</ToolButtonStyled>
		<Popper open={!!store.anchorElement && store.state !== TransformEnum.None} anchorEl={store.anchorElement} placement='right-start'>
			<Grow in>
				<Box sx={{
					borderRadius: Sizes.four,
					border: '1px solid ' + colors.background.darkest,
					p: 1, pt: 0.5, minWidth: '120px',
					bgcolor: colors.background.heavy,
					marginLeft: Sizes.sum(Sizes.twentyFour, '-4px'),
				}}>
					<TransformPopperContent/>
				</Box>
			</Grow>
		</Popper>
	</>;
});

const TransformPopperContent = observer(() => {
	const store = container.resolve(TransformStore);
	const scene = container.resolve(SceneStore);
	const position = SceneObject.CalculateGroupCenter(scene.groupSelected);

	return <>
		<Typography variant='body1' sx={{
			textTransform: 'capitalize'
		}}>
			{EnumHelpers.valueOf(TransformEnum, store.state)}
		</Typography>
		<Divider sx={{
			marginBottom: 1
		}}/>

		<TransformNumberValue
			color={colors.scene.x}
			text={'X'}
			value={position.x}
			textEnd='cm'
			marginTop
			updateValue={value => {
				scene.transformControlsDragging({ value: true });
				scene.transformObjectGroup.position.setX(value);
				scene.transformControlsUpdate();
				scene.transformControlsDragging({ value: false });
			}}/>
		<TransformNumberValue
			color={colors.scene.y}
			text={'Y'}
			value={position.y}
			textEnd='cm'
			marginTop
			updateValue={value => {
				scene.transformControlsDragging({ value: true });
				scene.transformObjectGroup.position.setY(value);
				scene.transformControlsUpdate();
				scene.transformControlsDragging({ value: false });
			}}/>
		<TransformNumberValue
			color={colors.scene.z}
			text={'Z'}
			value={position.z}
			textEnd='cm'
			marginTop
			updateValue={value => {
				scene.transformControlsDragging({ value: true });
				scene.transformObjectGroup.position.setZ(value);
				scene.transformControlsUpdate();
				scene.transformControlsDragging({ value: false });
			}}/>
		{/* <TransformNumberValue color={colors.scene.y} text={'Y'} value={position.y.toFixed(sharpness)} textEnd='°' marginTop/>
		<TransformNumberValue color={colors.scene.z} text={'Z'} value={position.z.toFixed(sharpness)} textEnd='%' marginTop/> */}
	</>;
});

const TransformNumberValue = observer((props: {
  color: string;
  text: string;
  textEnd: string;
  value: number;
  updateValue: (value: number) => void;
  marginTop?: boolean;
}) => {
	const reference = useState(createRef<HTMLInputElement>())[0];
	const sharpness = Math.log10(config.scene.sharpness) * -1;
	const [ isChanging, setChanging ] = useState(null as null | number);

	if (isChanging === null && reference.current) {
		reference.current.value = props.value.toFixed(sharpness);
	}

	return <Box sx={{
		border: '1px solid ' + colors.background.darkest,
		height: Sizes.twentyFour,
		width: '100%',
		borderRadius: Sizes.four,
		display: 'flex',
		justifyContent: 'space-between',
		overflow: 'hidden',
		marginTop: props.marginTop ? Sizes.four : 'unset'
	}}>
		<Box sx={{
			width: Sizes.twentyFour,
			backgroundColor: props.color,
			display: 'flex',
			...flexChildrenCenter
		}}>
			<Typography variant='body2'>
				{props.text}
			</Typography>
		</Box>
		<input
			defaultValue={props.value.toFixed(sharpness)}
			style={{
				border: 'unset',
				outline: 'unset',
				marginLeft: '2px',
			}}
			ref={reference}
			onChange={(e) => {
				const value = e.target.value.replace(',', '.');
				const number = parseFloat(value);
				if (number || number === 0) {
					setChanging(number);
					props.updateValue(number);
				}
			}}
			onBlur={() => {
				if (reference.current) {
					setChanging(null);
				}
			}}/>
		<Box sx={{
			width: Sizes.sum(Sizes.twentyFour, Sizes.eight),
			backgroundColor: props.color,
			display: 'flex',
			...flexChildrenCenter
		}}>
			<Typography variant='body2'>
				{props.textEnd}
			</Typography>
		</Box>
	</Box>;
});

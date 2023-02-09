import { Box,Grow,Popper,Typography, capitalize } from '@mui/material';
import { AiOutlineVerticalAlignBottom } from '@react-icons/all-files/ai/AiOutlineVerticalAlignBottom';
import { BiReset } from '@react-icons/all-files/bi/BiReset';
import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { MdLockOpen } from '@react-icons/all-files/md/MdLockOpen';
import { MdLockOutline } from '@react-icons/all-files/md/MdLockOutline';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { createRef, useState } from 'react';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { SceneStore } from 'renderer/Main/Scene/SceneStore';
import { colors, config } from 'renderer/Shared/Config';
import { Dispatch } from 'renderer/Shared/Events';
import { EnumHelpers } from 'renderer/Shared/Helpers/Enum';
import { flexChildrenCenter } from 'renderer/Shared/Styled/FlexBox';
import { Sizes } from 'renderer/Shared/Styled/Sizes';
import { MathUtils, Vector3 } from 'three';
import { Key } from 'ts-keycode-enum';
import { container } from 'tsyringe';
import { TransformStore } from './TransformStore';
import { AppEventEnum, AppEventMoveObject, TransformEnum } from '../../../../Shared/Libs/Types';
import { ToolButton } from '../../ToolsRight/Supports/Shared/ToolButton';
import { ToolButtonStyled } from '../Shared/ToolButton';

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
		<Popper open={!!store.anchorElement && store.state !== TransformEnum.None} anchorEl={store.anchorElement}
			placement='right-start' onResize={undefined} onResizeCapture={undefined}>
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

	if (!scene.groupSelected.length)
	{
		return <Typography variant='body2'>
      Please, select object on the scene.
		</Typography>;
	}

	const header = <><Typography variant='body1'>
		{capitalize(EnumHelpers.valueOf(TransformEnum, store.state))}
	</Typography></>;

	let body = undefined;

	switch (store.state)
	{
		case TransformEnum.Move:
			body = <>
				<TransformNumberValue
					color={colors.scene.x}
					text={'X'}
					value={position.x}
					textEnd='cm'
					marginTop
					updateValue={value => {
						scene.transformControlsDragging({ value: true });
						for (const sceneObject of scene.groupSelected) {
							Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
								from: sceneObject.mesh.position.clone(),
								to: sceneObject.mesh.position.clone().setX(value),
								sceneObject: sceneObject
							} as AppEventMoveObject);
						}
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
						for (const sceneObject of scene.groupSelected) {
							Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
								from: sceneObject.mesh.position.clone(),
								to: sceneObject.mesh.position.clone().setY(value),
								sceneObject: sceneObject
							} as AppEventMoveObject);
						}
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
						for (const sceneObject of scene.groupSelected) {
							Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
								from: sceneObject.mesh.position.clone(),
								to: sceneObject.mesh.position.clone().setZ(value),
								sceneObject: sceneObject
							} as AppEventMoveObject);
						}
						scene.transformControlsUpdate();
						scene.transformControlsDragging({ value: false });
					}}/>

				<Box sx={{
					display: 'flex',
					gap: 0.5,
					mt: '8px',
				}}>
					<ToolButton
						text='auto align to plane'
						isActive={store.alignToPlane}
						onClick={() => {
							runInAction(() => {
								store.alignToPlane = !store.alignToPlane;
							});
						}}>
						<AiOutlineVerticalAlignBottom color={colors.background.light}/>
					</ToolButton>

					<ToolButton
						text='reset'
						onClick={() => {
							scene.transformControlsDragging({ value: true });

							for (const sceneObject of scene.groupSelected) {
								Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
									from: sceneObject.mesh.position.clone(),
									to: new Vector3(0, 0, 0),
									sceneObject: sceneObject
								} as AppEventMoveObject);
							}

							scene.transformControlsUpdate();
							scene.transformControlsDragging({ value: false });
						}}>
						<BiReset color={colors.background.light}/>
					</ToolButton>
				</Box>
			</>;
			break;

		case TransformEnum.Rotate:
			body = <>
				<TransformNumberValue
					color={colors.scene.x}
					text={'X'}
					value={scene.groupSelectedLast?.mesh?.rotation.x * 180 / Math.PI}
					textEnd='o'
					marginTop
					updateValue={value => {
						scene.transformControlsDragging({ value: true });
						for (const sceneObject of scene.groupSelected) {
							Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
								from: sceneObject.mesh.rotation.clone(),
								to: sceneObject.mesh.rotation.clone().set(MathUtils.degToRad(value),
									sceneObject.mesh.rotation.y, sceneObject.mesh.rotation.z),
								sceneObject: sceneObject
							} as AppEventMoveObject);
						}
						scene.transformControlsUpdate();
						scene.transformControlsDragging({ value: false });
					}}/>
				<TransformNumberValue
					color={colors.scene.y}
					text={'Y'}
					value={scene.groupSelectedLast?.mesh?.rotation.y * 180 / Math.PI}
					textEnd='o'
					marginTop
					updateValue={value => {
						scene.transformControlsDragging({ value: true });
						for (const sceneObject of scene.groupSelected) {
							Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
								from: sceneObject.mesh.rotation.clone(),
								to: sceneObject.mesh.rotation.clone().set(sceneObject.mesh.rotation.x,
									MathUtils.degToRad(value), sceneObject.mesh.rotation.z),
								sceneObject: sceneObject
							} as AppEventMoveObject);
						}
						scene.transformControlsUpdate();
						scene.transformControlsDragging({ value: false });
					}}/>
				<TransformNumberValue
					color={colors.scene.z}
					text={'Z'}
					value={scene.groupSelectedLast?.mesh?.rotation.z * 180 / Math.PI}
					textEnd='o'
					marginTop
					updateValue={value => {
						scene.transformControlsDragging({ value: true });
						for (const sceneObject of scene.groupSelected) {
							Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
								from: sceneObject.mesh.rotation.clone(),
								to: sceneObject.mesh.rotation.clone().set(sceneObject.mesh.rotation.x,
									sceneObject.mesh.rotation.y, MathUtils.degToRad(value)),
								sceneObject: sceneObject
							} as AppEventMoveObject);
						}
						scene.transformControlsUpdate();
						scene.transformControlsDragging({ value: false });
					}}/>

				<Box sx={{
					display: 'flex',
					gap: 0.5,
					mt: '8px',
				}}>
					<ToolButton
						text='auto align to plane'
						isActive={store.alignToPlane}
						onClick={() => {
							runInAction(() => {
								store.alignToPlane = !store.alignToPlane;
							});
						}}>
						<AiOutlineVerticalAlignBottom color={colors.background.light}/>
					</ToolButton>

					<ToolButton
						text='reset'
						onClick={() => {
							scene.transformControlsDragging({ value: true });

							for (const sceneObject of scene.groupSelected) {
								Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
									from: sceneObject.mesh.rotation.clone(),
									to: new Vector3(0, 0, 0),
									sceneObject: sceneObject
								} as AppEventMoveObject);
							}

							scene.transformControlsUpdate();
							scene.transformControlsDragging({ value: false });
						}}>
						<BiReset color={colors.background.light}/>
					</ToolButton>
				</Box>
			</>;
			break;

		case TransformEnum.Scale:
			body = <>
				<TransformNumberValue
					color={colors.scene.x}
					text={'X'}
					value={scene.groupSelectedLast?.mesh?.scale.x * 100}
					textEnd='%'
					marginTop
					updateValue={number => {
						scene.transformControlsDragging({ value: true });

						const mesh = scene.groupSelectedLast?.mesh;

						Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
							from: mesh.scale.clone(),
							to: mesh.scale.clone().set(number / 100,
								mesh.scale.y, mesh.scale.z),
							sceneObject: scene.groupSelectedLast
						} as AppEventMoveObject);

						scene.transformControlsUpdate();
						scene.transformControlsDragging({ value: false });
					}}/>
				<TransformNumberValue
					color={colors.scene.y}
					text={'Y'}
					value={scene.groupSelectedLast?.mesh?.scale.y * 100}
					textEnd='%'
					marginTop
					updateValue={number => {
						scene.transformControlsDragging({ value: true });

						const mesh = scene.groupSelectedLast?.mesh;

						Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
							from: mesh.scale.clone(),
							to: mesh.scale.clone().set(mesh.scale.x, number / 100, mesh.scale.z),
							sceneObject: scene.groupSelectedLast
						} as AppEventMoveObject);

						scene.transformControlsUpdate();
						scene.transformControlsDragging({ value: false });
					}}/>
				<TransformNumberValue
					color={colors.scene.z}
					text={'Z'}
					value={scene.groupSelectedLast?.mesh?.scale.z * 100}
					textEnd='%'
					marginTop
					updateValue={number => {
						scene.transformControlsDragging({ value: true });

						const mesh = scene.groupSelectedLast?.mesh;

						Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
							from: mesh.scale.clone(),
							to: mesh.scale.clone().set(mesh.scale.x, mesh.scale.y, number / 100),
							sceneObject: scene.groupSelectedLast
						} as AppEventMoveObject);

						scene.transformControlsUpdate();
						scene.transformControlsDragging({ value: false });
					}}/>

				<Box sx={{
					display: 'flex',
					gap: 0.5,
					mt: '8px',
				}}>
					<ToolButton
						text='fixed'
						isActive={store.fixedScale}
						onClick={() => {
							runInAction(() => {
								store.fixedScale = !store.fixedScale;
							});
						}}>
						{store.fixedScale
							? <MdLockOutline color={colors.background.light}/>
							: <MdLockOpen color={colors.background.light}/>}
					</ToolButton>

					<ToolButton
						text='auto align to plane'
						isActive={store.alignToPlane}
						onClick={() => {
							runInAction(() => {
								store.alignToPlane = !store.alignToPlane;
							});
						}}>
						<AiOutlineVerticalAlignBottom color={colors.background.light}/>
					</ToolButton>

					<ToolButton
						text='reset'
						onClick={() => {
							scene.transformControlsDragging({ value: true });

							const mesh = scene.groupSelectedLast?.mesh;

							const lock = store.fixedScale;
							store.fixedScale = false;
							Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
								from: mesh.scale.clone(),
								to: new Vector3(1, 1, 1),
								sceneObject: scene.groupSelectedLast
							} as AppEventMoveObject);
							store.fixedScale = lock;

							scene.transformControlsUpdate();
							scene.transformControlsDragging({ value: false });
						}}>
						<BiReset color={colors.background.light}/>
					</ToolButton>
				</Box>
			</>;
			break;
	}

	return <>
		{header}
		{body}
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
		marginTop: props.marginTop ? Sizes.four : 'unset',
		backgroundColor: colors.background.dark,
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
			onKeyUp={(event) => {
				if (event.keyCode === Key.UpArrow || event.keyCode === Key.RightArrow || event.keyCode === Key.W)
				{
					const value = props.value + 1;
					setChanging(value);
					props.updateValue(value);
          reference!.current!.value = value.toFixed(sharpness);
				}
				if (event.keyCode === Key.DownArrow || event.keyCode === Key.LeftArrow || event.keyCode === Key.S)
				{
					const value = props.value - 1;
					setChanging(value);
					props.updateValue(value);
          reference!.current!.value = value.toFixed(sharpness);
				}
			}}
			defaultValue={props.value.toFixed(sharpness)}
			style={{
				border: 'unset',
				outline: 'unset',
				marginLeft: '2px',
				backgroundColor: colors.background.dark,
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

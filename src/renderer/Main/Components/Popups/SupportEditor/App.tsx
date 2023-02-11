import { Box, Grid, Grow, Tooltip, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { createRef, useState } from 'react';
import { AppStore } from '../../../../AppStore';
import { colors, config } from '../../../../Shared/Config';
import { flexChildrenCenter } from '../../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../../Shared/Styled/Sizes';
import { Printer } from '../../../Printer/Configs/Printer';

export const SupportEditorApp = observer(() => {
	if (!AppStore.sceneStore.isOpenSupportEditor)
	{
		return <Box/>;
	}

	const printer = AppStore.sceneStore.printer!;
	const preset = printer.SupportPreset;
	const close = () => {
		AppStore.sceneStore.isOpenSupportEditor = false;
		Printer.SaveToFile(printer);
	};

	return <Box onClick={close} sx={{
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(114,114,114,0.47)',
		position: 'absolute',
		zIndex: 9999,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	}}>
		<Grow in>
			<Box onClick={(e) => e.stopPropagation()} sx={{
				borderRadius: Sizes.four,
				border: '1px solid ' + colors.background.darkest,
				p: 1, pt: 0.5, minWidth: '120px',
				bgcolor: colors.background.heavy,
				marginLeft: Sizes.sum(Sizes.twentyFour, '-4px'),
				width: 'fit-content',
				maxWidth: '80%',
				height: 'fit-content',
				maxHeight: '80%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column'
			}}>
				<Typography variant='body1' alignSelf={'start'} mb={0.5}>
          Support preset editor
				</Typography>
				<Grid container gap={1}>
					{Object.entries(preset).map((item: [string, string | number]) => {
						const name = item[0];
						const value = item[1];
						const description = Description(name) as DescriptionRow;

						return <Grid item key={name}>
							<Value
								color={colors.scene.x}
								description={description}
								value={value}
								updateValue={newValue => {
									//eslint-disable-next-line @typescript-eslint/ban-ts-comment
									//@ts-ignore
									preset[name] = newValue;
									AppStore.sceneStore.printer = { ...AppStore.sceneStore.printer } as Printer;
								}}/>
						</Grid>;
					})}
				</Grid>
				<Box onClick={close} sx={{
					width: 'fit-content',
					height: 'fit-content',
					pl: 1, pr: 1, marginTop: 1,
					backgroundColor: '#5f9333',
					display: 'flex',
					alignSelf: 'start',
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: '4px',
					border: '1px solid ' + colors.background.dark,
					userSelect: 'none',
					':hover': {
						backgroundColor: '#6fad39',
					}
				}}>
					<Typography variant='body2'>
            Apply and close
					</Typography>
				</Box>
			</Box>
		</Grow>
	</Box>;
});

export const Value = observer((props: {
  color: string;
  description: DescriptionRow;
  value: number | string;
  updateValue: (value: number | string) => void;
}) => {
	const isValueAsString = props.description.type === 'string';
	const reference = useState(createRef<HTMLInputElement>())[0];
	const sharpness = Math.log10(config.scene.sharpness) * -1;

	const defaultValue = isValueAsString === false
		? props.description.type === 'int'
			? parseInt(props.value + '').toString()
			: parseFloat(props.value + '').toFixed(sharpness)
		: props.value as string;

	const [ isChanging, setChanging ] = useState(null as null | number | string);

	if (isChanging === null && reference.current) {
		reference.current.value = defaultValue;
	}

	return <Tooltip title={props.description.description} arrow placement="top" PopperProps={{
		sx: {
			userSelect: 'none',
			zIndex: 10000,
		}
	}}>
		<Box sx={{
			border: '1px solid ' + colors.background.darkest,
			height: Sizes.twentyFour,
			width: 'fit-content',
			borderRadius: Sizes.four,
			display: 'flex',
			justifyContent: 'space-between',
			overflow: 'hidden',
			marginTop: 'unset',
			backgroundColor: colors.background.dark,
		}}>
			<Box sx={{
				width: 'fit-content',
				pl: 0.75, pr: 0.75,
				backgroundColor: props.color,
				display: 'flex',
				...flexChildrenCenter
			}}>
				<Typography variant='body2'>
					{props.description.name}
				</Typography>
			</Box>
			<input
				defaultValue={defaultValue}
				style={{
					border: 'unset',
					outline: 'unset',
					marginLeft: '2px',
					backgroundColor: colors.background.dark,
					width: isValueAsString ? 'fit-content' : '90px'
				}}
				ref={reference}
				onChange={(e) => {
					console.log(e.target.value, props, 2, isValueAsString, props.description.type !== 'string');
					if (isValueAsString)
					{
						setChanging(e.target.value);
						props.updateValue(e.target.value);
						console.log(e.target.value, 1);
					}
					else {
						const value = e.target.value.replace(',', '.');

						let number = props.description.type === 'int'
							? Math.round(parseInt(value))
							: parseFloat(value);

						if (number as any instanceof Number) {
							if (props.description.maxNumber !== undefined)
							{
								if (number > props.description.maxNumber)
								{
									number = props.description.maxNumber;
								}
							}
							if (props.description.minNumber !== undefined)
							{
								if (number < props.description.minNumber)
								{
									number = props.description.minNumber;
								}
							}

							setChanging(number);
							props.updateValue(number);
						}
					}
				}}
				onBlur={() => {
					if (reference.current) {
						setChanging(null);
					}
				}}/>
			{props.description.textend && <Box sx={{
				width: 'fit-content', pl: 0.75, pr: 0.75,
				backgroundColor: props.color,
				display: 'flex',
				...flexChildrenCenter
			}}>
				<Typography variant='body2'>
					{props.description.textend}
				</Typography>
			</Box>}
		</Box>
	</Tooltip>;
});

const Description = (name: string) => {
	switch (name)
	{
		case 'Name':
			return {
				name: 'Preset name',
				type: 'string'
			};
		case 'ConnectionSphere':
			return {
				name: 'Connection diameter',
				description: 'Diameter of sphere who connected with the model.',
				minNumber: 0,
				maxNumber: 50,
				textend: 'cm',
				type: 'float'
			};
		case 'Head':
			return {
				name: 'Head diameter',
				description: 'Diameter of final part of support who connected with the model.',
				minNumber: config.scene.sharpness,
				maxNumber: 50,
				textend: 'cm',
				type: 'float'
			};
		case 'Body':
			return {
				name: 'Body diameter',
				description: 'Diameter of central part of support.',
				minNumber: config.scene.sharpness,
				maxNumber: 50,
				textend: 'cm',
				type: 'float'
			};
		case 'Indent':
			return {
				name: 'Indent from the model',
				description: 'Indent from the all model of the scene. Other supports was ignored.',
				minNumber: config.scene.sharpness,
				maxNumber: 50,
				textend: 'cm',
				type: 'float'
			};
		case 'Angle':
			return {
				name: 'Max available angle',
				description: 'Max available angle when support is generating.',
				minNumber: 1,
				maxNumber: 90,
				textend: 'o',
				type: 'float'
			};
		case 'PlatformWidth':
			return {
				name: 'Platform width',
				description: 'Platform who hold ur model.',
				minNumber: config.scene.sharpness,
				maxNumber: 100,
				textend: 'cm',
				type: 'float'
			};
		case 'PlatformHeight':
			return {
				name: 'Platform height',
				description: 'Platform who hold ur model',
				minNumber: config.scene.sharpness,
				maxNumber: 100,
				textend: 'cm',
				type: 'float'
			};
		case 'Density':
			return {
				name: 'Density of the supports',
				description: 'This argument who regulate the density of the supports. [1 - 50]',
				minNumber: 1,
				maxNumber: 50,
				textend: 'unit',
				type: 'float'
			};
		case 'Rays':
			return {
				name: 'Rays count',
				description: 'This performance argument which means count of rays when supports is generating. More rays -> More sharpness -> Lower performance',
				minNumber: 1,
				maxNumber: 50,
				textend: 'unit',
				type: 'int'
			};
		case 'Lifting':
			return {
				name: 'Lifting the model',
				description: 'The space between the print plane and the model that the supports fill.',
				minNumber: 0,
				maxNumber: 1000,
				textend: 'cm',
				type: 'float'
			};
		default:
			return {
				name: 'Unknown',
				type: 'string'
			} as DescriptionRow;
	}
};

/*
public Name: string,
  // all diameters
  public ConnectionSphere: number,
  public Head: number,
  public Body: number,
  public Indent: number,
  public Angle: number,
  public PlatformWidth: number,
  public PlatformHeight: number,
  public Density: number,
  public Rays: number,
  public Lifting: number,
*/

export type DescriptionRow = {
  name: string;
  textend?: string;
  description?: string;
  maxNumber?: number;
  minNumber?: number;
  type: 'string' | 'int' | 'float';
};

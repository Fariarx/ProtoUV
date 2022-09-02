import { Box, Divider, Grow, Popper, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import React, { ReactElement } from 'react';
import { AppStore } from '../../../../AppStore';
import { TransformEnum } from '../../../../Shared/Libs/Types';
import { Sizes } from '../../../../Shared/Styled/Sizes';
import { colors } from '../../../../Shared/Theme';
import { ToolButtonStyled } from '../ToolButtonStyled';
import { TransformStore } from './TransformStore';

const size = Sizes.twentyFour;

export const TransformPopover = observer((props: {
  store: TransformStore;
  tool: TransformEnum;
  description: string;
  icon: ReactElement;
}) => {
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const isOpen = Boolean(anchorEl);

	if (props.store.state !== props.tool && anchorEl)
	{
		setAnchorEl(null);
	}

	return <>
		<ToolButtonTransform
			tool={props.tool}
			onClick={(arg) => setAnchorEl(anchorEl ? null : arg)}
			description={!isOpen ? props.description : ''}
			store={props.store}
			size={size}>
			{props.icon}
		</ToolButtonTransform>
		<Popper
			placement={'bottom-end'}
			anchorEl={anchorEl}
			open={isOpen}>
			<Grow in={isOpen}>
				<Box sx={{
					m: Sizes.eight,
					mt: Sizes.sum(Sizes.eight, Sizes.one),
					ml: 0,
					borderRadius: Sizes.eight,
					border: '1px solid ' + colors.background.commonest,
					backgroundColor: colors.background.dark,
					width: Sizes.multiply(Sizes.fortyEight, 4)
				}}>
					<Typography variant="subtitle1" sx={{ textTransform: 'capitalize', m: Sizes.twelve, mt: Sizes.eight, mr: Sizes.eight }}>
						{props.description}
					</Typography>
					<Divider/>
					<Stack direction={'row'} sx={{
						backgroundColor: colors.background.dark,
						borderRadius: Sizes.eight,
						height: Sizes.fortyEight,
						width: '100%'
					}}>

					</Stack>
				</Box>
			</Grow>
		</Popper>
	</>;
});

const ToolButtonTransform = observer((props: {
  children: React.ReactElement;
  store: TransformStore;
  tool: TransformEnum;
  description: string;
  size: string;
  onClick?: (arg: HTMLElement) => void;
}) => {
	const change = (state: TransformEnum, arg: React.MouseEvent<HTMLElement>) => {
		props.onClick?.(arg.currentTarget as HTMLElement);
		AppStore.transform.state = state === AppStore.transform.state ?
			TransformEnum.None : state;
	};

	return <ToolButtonStyled
		onClick={(arg) => change(props.tool, arg)}
		description={props.description}
		selected={props.store.state === props.tool}>
		{props.children}
	</ToolButtonStyled>;
});

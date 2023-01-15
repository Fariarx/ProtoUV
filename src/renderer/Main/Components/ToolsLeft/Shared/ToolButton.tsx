import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import React from 'react';
import { colors } from '../../../../Shared/Config';
import { FlexBoxColumnFit, flexChildrenCenter } from '../../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../../Shared/Styled/Sizes';

export const ToolButtonStyled = observer((props: {
  children: React.ReactElement;
  onClick: (arg: React.MouseEvent<HTMLElement>) => void;
  description: string;
  selected: boolean;
  clickColor?: string;
  hoverColor?: string;
  mini?: boolean;
  sx?: any;
}) => {
	const size = Sizes.multiply(Sizes.eight, 4);

	return <Tooltip title={props.description} arrow placement="right" PopperProps={{
		sx: {
			display: props.selected ? 'none' : 'block',
			userSelect: 'none',
		}
	}}>
		<FlexBoxColumnFit onClick={props.onClick} sx={{
			...flexChildrenCenter,
			width: props.mini ? Sizes.sum(size, Sizes.sixteen) : Sizes.sum(size, size),
			height: size,
			backgroundColor: props.selected ? colors.interact.neutral : colors.background.heavy,
			transition: 'all 0.3s',
			boxShadow: '0px 0px 0px 1px ' + colors.background.darkest,
			color: props.selected ? colors.background.white : colors.background.light,
			'&:hover': {
				backgroundColor: props.hoverColor ?? colors.interact.neutral
			},
			'&:active': {
				backgroundColor: props.clickColor ?? colors.interact.touch1,
				transform: 'translateY(-1px)'
			},
			...props.sx
		}}>
			{props.children}
		</FlexBoxColumnFit>
	</Tooltip>;
});

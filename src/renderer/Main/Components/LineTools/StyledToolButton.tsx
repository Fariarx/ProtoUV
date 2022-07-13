import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import React from 'react';
import { FlexBoxColumnFit, flexChildrenCenter } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { colors } from '../../../Shared/Theme';

export const StyledToolButton = observer((props: {
  children: React.ReactElement;
  onClick: () => void;
  description: string;
  selected: boolean;
  clickColor?: string;
  hoverColor?: string;
}) => {
	const size = Sizes.twentyFour;

	return <Tooltip title={props.description} arrow>
		<FlexBoxColumnFit onClick={props.onClick} sx={{
			width: Sizes.sum(size, size),
			height: size,
			...flexChildrenCenter,
			marginRight: Sizes.four,
			borderRadius: props.selected ? Sizes.eight : '3px',
			backgroundColor: props.selected ? colors.interact.neutral : colors.background.common,
			transition: 'all 0.3s',
			color: props.selected ? colors.background.white : colors.background.light,
			'&:hover': {
				borderRadius: Sizes.eight,
				backgroundColor: props.hoverColor ?? colors.interact.neutral
			},
			'&:active': {
				//borderRadius: Sizes.four,
				backgroundColor: props.clickColor ?? colors.interact.touch,
				transform: 'translateY(-2px)'
			}
		}}>
			{props.children}
		</FlexBoxColumnFit>
	</Tooltip>;
});

import { Box, Tooltip } from '@mui/material';
import { ReactElement } from 'react';
import { colors } from 'renderer/Shared/Config';

export const ToolButton = (props: {
  children: ReactElement;
  isActive?: boolean;
  onClick: () => void;
  text: string;
  placement?: string | any;
}) => {

	return <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{props.text}</span>} arrow placement={props.placement ?? 'bottom'}>
		<Box
			onClick={props.onClick}
			sx={{
				backgroundColor: colors.background.dark,
				borderRadius: '4px',
				width: '36px',
				height: '24px',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				transition: 'all 0.4',
				':hover': {
					backgroundColor: colors.background.darkest
				},
				':active': {
					backgroundColor: colors.background.black
				}
			}}>
			{props.children}
			{props.isActive && <Box sx={{
				width: '24px',
				height: '3px',
				position: 'absolute',
				backgroundColor: colors.interact.touch1,
				marginTop: '21px',
				borderRadius: '2px',
			}}/>}
		</Box>
	</Tooltip>;
};

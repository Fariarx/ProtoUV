import { ToggleButton } from '@mui/material';
import { colors } from '../Colors';

export const ButtonSetting = (props: {
  children: React.ReactNode;
  onClick?: ()=> any;
  checked?: boolean;
}) => {
	return <ToggleButton
		value="check"
		onClick={props.onClick}
		sx={{
			backgroundColor: props.checked ?
				colors.interact.touch
				: colors.background.common,
			'& svg': {
				color: 'rgba(255,255,255,0.8)',
				transition: '0.2s',
				transform: 'translateX(0) rotate(0) scale(1.5)',
			},
			'&:hover': {
				'& svg:first-of-type': {
					transform: 'rotate(-30deg) scale(1.7)',
				},
				'& svg:last-of-type': {
					right: 0,
					opacity: 1,
				},
				backgroundColor: props.checked ?
					colors.interact.touch
					: colors.background.commonLight,
			},
		}}>
		{props.children}
	</ToggleButton>;
};

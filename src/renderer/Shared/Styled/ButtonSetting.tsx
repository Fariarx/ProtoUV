import { ToggleButton } from '@mui/material';
import { colors } from '../Colors';

export const ButtonSetting = (props: {
  onClick?: ()=>any;
  selected?: boolean;
  children?:
    | React.ReactChild
    | React.ReactChild[];
}) => {
	return <ToggleButton
		value="check"
		selected={props.selected ?? false}
		onClick={props.onClick}
		sx={{
			backgroundColor: colors.background.common,
			'& svg': {
				color: 'rgba(255,255,255,0.8)',
				transition: '0.2s',
				transform: 'translateX(0) rotate(0) scale(1.5)',
			},
			'&:hover': {
				'& svg:first-of-type': {
					transform: 'rotate(-25 deg) scale(1.7)',
				},
				'& svg:last-of-type': {
					right: 0,
					opacity: 1,
				},
			},
		}}>
		{props.children}
	</ToggleButton>;
};

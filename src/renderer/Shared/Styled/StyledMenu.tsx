import { Menu, MenuProps, alpha, styled } from '@mui/material';
import { colors } from '../Config';
import { Sizes } from './Sizes';

export const StyledMenu = styled((props: MenuProps) => (
	<Menu
		elevation={1}
		{...props}
	/>
))(({ theme }) => ({
	'& .MuiPaper-root': {
		fontSize: Sizes.sixteen,
		border: '1px solid ' + colors.background.commonest,
		backgroundColor: colors.background.heavy,
		minWidth: 140,
		borderRadius: 0,
		color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
		boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
		'& .MuiMenu-list': {
			padding: '4px 0',
		},
		'& .MuiMenuItem-root': {
			'& .MuiSvgIcon-root': {
				color: theme.palette.text.secondary,
			},
			'&:active': {
				backgroundColor: alpha(
					theme.palette.primary.main,
					theme.palette.action.selectedOpacity,
				),
			},
		},
	},
}));

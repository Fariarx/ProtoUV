import { createTheme } from '@mui/material';
import { colors } from './Config';

export const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: colors.interact.touch
		}
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: {
					scrollbarColor: '#6b6b6b #2b2b2b',
					'&::-webkit-scrollbar, & *::-webkit-scrollbar': {
						backgroundColor: '#2b2b2b',
						borderRadius: 8,
					},
					'&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
						borderRadius: 8,
						backgroundColor: '#6b6b6b',
						minHeight: 24,
						border: '3px solid #2b2b2b',
					},
					'&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
						backgroundColor: '#959595',
					},
					'&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
						backgroundColor: '#959595',
					},
					'&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
						backgroundColor: '#959595',
					},
					'&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
						backgroundColor: '#2b2b2b',
						borderRadius: 8,
					},
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: colors.background.darkest
				}
			}
		}
	},
});

export const UpdateScheme = () => {
	document.body.style.background = colors.background.heavy;
};

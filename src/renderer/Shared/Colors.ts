import { createTheme } from '@mui/material';

export const colors = {
	typography:{
		background:'#aaaaaa'
	},
	background:{
		black:'#000',
		dark:'#2d2d2d',
		heavy:'#3B3F40',
		common:'#444444',
		commonLight:'#565656',
		light:'#cbcbcb',
		white: '#fff'
	},
	interact:{
		touch:'#4168c0',
		warning:'#ffbd39',
		danger:'#fb594f',
	},
	scene:{
		colorBackgroundScene:'#2f2f2f',
		colorBackgroundSceneBottom:'#6c6c6c',
		colorBackground:'#1d1d1d',
		color1:'#2a2a2a',
		workingPlaneLimitColor:'#d4605a',
		workingPlaneColor:'#68798d',
	}
};

export const darkTheme = createTheme({
	palette: {
		mode: 'dark',
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
	},
});

export const UpdateScheme = () => {
	document.body.style.background = colors.background.heavy;
};

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
});

export const UpdateScheme = () => {
	document.body.style.background = colors.background.heavy;
};

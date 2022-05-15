import { createTheme } from '@mui/material';

export const colors = {
	typography:{
		background:'#aaaaaa'
	},
	background:{
		dark:'#15191a',
		heavy:'#1f2427',
		common:'#444444',
		white: '#fff'
	},
	interact:{
		touch:'#65e14d',
		selected:'#4e8649',
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

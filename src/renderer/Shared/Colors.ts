export const colors = {
	background:{
		dark:'#15191a',
		heavy:'#1f2427',
		common:'#444444',
		white: '#fff'
	},
	interact:{
		touch:'#65e14d',
		warning:'#ffbd39',
		danger:'#fb594f'
	},
};

export const UpdateScheme = () => {
	document.body.style.background = colors.background.common;
};

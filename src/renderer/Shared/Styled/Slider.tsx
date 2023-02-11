import { Slider, styled } from '@mui/material';

export const SliceSlider = styled(Slider)(() => ({
	'.MuiSlider-thumb': {
		borderRadius: 0,
		width: '14px',
		height: '14px'
	},
	'& .MuiSlider-rail': {
		color:  '#bfbfbf',
	},
	'.MuiSlider-track': {
		width: '10px',
		borderRadius: 0
	},
	'.MuiSlider-rail': {
		width: '6px',
		borderRadius: 0
	}
}));

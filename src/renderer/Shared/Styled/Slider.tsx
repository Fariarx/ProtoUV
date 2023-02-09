import { Slider, styled } from '@mui/material';

export const SliceSlider = styled(Slider)(() => ({
	'.MuiSlider-thumb': {
		borderRadius: 0,
	},
	'& .MuiSlider-rail': {
		color:  '#bfbfbf',
	},
	'.MuiSlider-track': {
		width: '12px',
		borderRadius: 0
	},
	'.MuiSlider-rail': {
		width: '8px',
		borderRadius: 0
	}
}));

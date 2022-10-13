import { Box } from '@mui/material';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { CameraTypeApp } from './CameraTypeApp';

export const ViewChangeApp = () => {
	return <Box sx={{
		right: 0,
		position: 'absolute',
		p: Sizes.eight
	}}>
		<CameraTypeApp/>
	</Box>;
};
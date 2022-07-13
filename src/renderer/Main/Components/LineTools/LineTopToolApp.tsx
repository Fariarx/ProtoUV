import { Divider } from '@mui/material';
import { FlexBoxRow } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { colors } from '../../../Shared/Theme';
import { CameraTypeApp } from './CameraTypeApp';
import { TransformApp } from './Transform/TransformApp';

export const LineTopToolApp = () => {
	return <FlexBoxRow sx={{
		height: 'fit-content',
		padding: Sizes.four,
		backgroundColor: colors.background.dark,
	}}>
		<TransformApp/>
		<Divider orientation="vertical" flexItem sx={{ mr: Sizes.four }}/>
		<CameraTypeApp/>
	</FlexBoxRow>;
};

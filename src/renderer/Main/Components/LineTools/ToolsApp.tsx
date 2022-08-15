import { Box } from '@mui/material';
import { FlexBoxRow } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { colors } from '../../../Shared/Theme';
import { TransformApp } from './Transform/TransformApp';

export const ToolsApp = () => {
	return <FlexBoxRow sx={{
		height: 'fit-content',
		padding: Sizes.four,
		backgroundColor: colors.background.dark,
	}}>
		<TransformApp/>
		<Box sx={{ ml: Sizes.twentyFour }}/>
	</FlexBoxRow>;
};

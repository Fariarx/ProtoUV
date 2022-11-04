import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { FlexBoxRow } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { TransformApp } from '../Transform/TransformApp';

export const ToolsLeftApp = () => {
	return <FlexBoxRow
		sx={{
			height: 'fit-content',
			width: 'fit-content',
			flexDirection: 'column',
			position: 'absolute',
			top: Sizes.sum(APP_HEADER_HEIGHT_PX, Sizes.eight),
			left: 0,
		}}>
		<TransformApp/>
	</FlexBoxRow>;
};

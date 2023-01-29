import { TransformApp } from './Transform/TransformApp';
import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { FlexBoxRow } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { SliceSliderApp } from '../Slice/SliceSliderApp';

export const ToolsLeftApp = () => {
	return <FlexBoxRow
		sx={{
			height: 'calc(100% - 15% - 90px)',
			width: 'fit-content',
			flexDirection: 'column',
			position: 'absolute',
			top: Sizes.sum(APP_HEADER_HEIGHT_PX, Sizes.eight),
			left: 0,
		}}>
		<TransformApp/>
		<SliceSliderApp/>
	</FlexBoxRow>;
};

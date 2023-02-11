import { TransformApp } from './Transform/App';
import { APP_HEADER_HEIGHT_PX } from '../../../Screen/Header/App';
import { FlexBoxRow } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { SliceSliderApp } from '../Slice/SliceSlider';

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

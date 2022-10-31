import { APP_HEADER_HEIGHT_PX } from 'renderer/HeaderApp';
import { FlexBoxRow } from '../../Shared/Styled/FlexBox';
import { Sizes } from '../../Shared/Styled/Sizes';
import { TransformApp } from './Transform/TransformApp';

export const ToolsApp = () => {
	return <FlexBoxRow
		sx={{
			height: 'fit-content',
			width: 'fit-content',
			flexDirection: 'column',
			position: 'absolute',
			top: Sizes.sum(APP_HEADER_HEIGHT_PX, Sizes.fortyEight),
			left: 0,
		}}>
		<TransformApp/>
	</FlexBoxRow>;
};

import { FlexBoxRow } from '../../Shared/Styled/FlexBox';
import { Sizes } from '../../Shared/Styled/Sizes';
import { TransformApp } from './Transform/TransformApp';

export const ToolsApp = () => {
	return <FlexBoxRow
		sx={{
			marginTop: Sizes.fortyEight,
			height: 'fit-content',
			width: 'fit-content',
			flexDirection: 'column',
			position: 'absolute'
		}}>
		<TransformApp/>
	</FlexBoxRow>;
};

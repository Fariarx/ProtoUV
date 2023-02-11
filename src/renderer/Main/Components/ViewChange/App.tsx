import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';
import { CameraTypeApp } from './CameraType/App';
import { LockLookAtCenterApp } from './LockLookAtCenter/App';
import { APP_HEADER_HEIGHT_PX } from '../../../Screen/Header/App';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { ToolsRightStore } from '../ToolsRight/Store';

export const ViewChangeApp = observer(() => {
	return <Box sx={{
		right: (container.resolve(ToolsRightStore).width + 22) + 'px',
		top: Sizes.sum(APP_HEADER_HEIGHT_PX, '10px'),
		position: 'absolute',
	}}>
		<LockLookAtCenterApp/>
		<CameraTypeApp/>
	</Box>;
});

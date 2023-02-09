import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';
import { CameraTypeApp } from './CameraTypeApp';
import { FlyModeApp } from './FlyModeApp';
import { LockLookAtCenterApp } from './LockLookAtCenterApp';
import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { ToolsRightStore } from '../ToolsRight/ToolsRightStore';

export const ViewChangeApp = observer(() => {
	return <Box sx={{
		right: (container.resolve(ToolsRightStore).width + 22) + 'px',
		top: Sizes.sum(APP_HEADER_HEIGHT_PX, '10px'),
		position: 'absolute',
	}}>
		<LockLookAtCenterApp/>
		<FlyModeApp/>
		<CameraTypeApp/>
	</Box>;
});

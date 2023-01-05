import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';
import { APP_HEADER_HEIGHT_PX } from '../../../HeaderApp';
import { config } from '../../../Shared/Config';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { ToolsTabStore } from '../ToolsTab/ToolsTabStore';
import { CameraTypeApp } from './CameraTypeApp';
import { LockLookAtCenterApp } from './LockLookAtCenterApp';

export const ViewChangeApp = observer(() => {
	return <Box sx={{
		right: (container.resolve(ToolsTabStore).width + 22) + 'px',
		top: Sizes.sum(APP_HEADER_HEIGHT_PX, Sizes.eight),
		position: 'absolute',
		//border: '1px solid ' + colors.background.darkest,
		//borderRadius: Sizes.twentyFour,
		//backgroundColor: colors.background.common,
		opacity: config.ui.opacity,
	}}>
		<LockLookAtCenterApp/>
		<CameraTypeApp/>
	</Box>;
});

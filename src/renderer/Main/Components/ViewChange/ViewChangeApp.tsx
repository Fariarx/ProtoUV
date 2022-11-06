import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { ToolsTabStore } from '../ToolsTab/ToolsTabStore';
import { CameraTypeApp } from './CameraTypeApp';

export const ViewChangeApp = observer(() => {
	return <Box sx={{
		right: container.resolve(ToolsTabStore).width + 'px',
		bottom: Sizes.twentyFour,
		position: 'absolute',
		p: Sizes.eight
	}}>
		<CameraTypeApp/>
	</Box>;
});

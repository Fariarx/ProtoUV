import { IconButton, Tooltip } from '@mui/material';
import { FaEye } from '@react-icons/all-files/fa/FaEye';
import { MdBlurLinear } from '@react-icons/all-files/md/MdBlurLinear';
import { observer } from 'mobx-react';
import { AppStore } from '../../../../AppStore';
import { config } from '../../../../Shared/Config';
import { colors } from '../../../../Shared/Config';

export const CameraTypeApp = observer(() => {
	return <Tooltip title={config.scene.setStartupPerspectiveCamera ? 'perspective' : 'orthographic'} arrow placement="bottom" PopperProps={{
		sx: {
			userSelect: 'none',
		}
	}}>
		<IconButton
			size='small'
			onClick={() => {
				AppStore.sceneStore.updateCameraType(!config.scene.setStartupPerspectiveCamera);
			}}>
			{config.scene.setStartupPerspectiveCamera
				? <FaEye color={colors.background.light}/>
				: <MdBlurLinear color={colors.background.light}/>}
		</IconButton>
	</Tooltip>;
});

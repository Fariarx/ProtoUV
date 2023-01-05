import { IconButton, Tooltip } from '@mui/material';
import { FaEye } from '@react-icons/all-files/fa/FaEye';
import { MdBlurLinear } from '@react-icons/all-files/md/MdBlurLinear';
import { useState } from 'react';
import { AppStore } from '../../../AppStore';
import { config } from '../../../Shared/Config';
import { colors } from '../../../Shared/Config';

export const CameraTypeApp = () => {
	const [isPerspective, setterIsPerspective] = useState(config.scene.setStartupPerspectiveCamera);

	return <Tooltip title={isPerspective ? 'perspective' : 'orthographic'} arrow placement="bottom" PopperProps={{
		sx: {
			userSelect: 'none',
		}
	}}>
		<IconButton
			size='small'
			onClick={() => {
				AppStore.sceneStore.updateCameraType(!isPerspective);
				setterIsPerspective(!isPerspective);
			}}>
			{isPerspective
				? <FaEye color={colors.background.light}/>
				: <MdBlurLinear color={colors.background.light}/>}
		</IconButton>
	</Tooltip>;
};

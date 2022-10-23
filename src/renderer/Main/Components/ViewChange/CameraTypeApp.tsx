import { IconButton } from '@mui/material';
import { FaEye } from '@react-icons/all-files/fa/FaEye';
import { MdBlurLinear } from '@react-icons/all-files/md/MdBlurLinear';
import { useState } from 'react';
import { AppStore } from '../../../AppStore';
import { config } from '../../../Shared/Config';
import { colors } from '../../../Shared/Theme';

export const CameraTypeApp = () => {
	const [isPerspective, setterIsPerspective] = useState(config.scene.setStartupPerspectiveCamera);

	return <IconButton
		onClick={() => {
			AppStore.sceneStore.switchCameraType(!isPerspective);
			setterIsPerspective(!isPerspective);
		}}>
		{isPerspective
			? <FaEye color={colors.background.light}/>
			: <MdBlurLinear color={colors.background.light}/>}
	</IconButton>;
};

import { IconButton } from '@mui/material';
import { MdBlurLinear } from '@react-icons/all-files/md/MdBlurLinear';
import { RiEye2Line } from '@react-icons/all-files/ri/RiEye2Line';
import { useState } from 'react';
import { AppStore } from '../../../AppStore';
import { config } from '../../../Shared/Config';

export const CameraTypeApp = () => {
	const [isPerspective, setterIsPerspective] = useState(config.scene.setStartupPerspectiveCamera);

	return <IconButton onClick={() => {
		AppStore.sceneStore.switchCameraType(!isPerspective);
		setterIsPerspective(!isPerspective);
	}}>
		{isPerspective ? <RiEye2Line transform={'scale(1.1)'} /> :
			<MdBlurLinear transform={'scale(1.1)'} />}
	</IconButton>;
};

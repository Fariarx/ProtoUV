import { MdBlurLinear } from '@react-icons/all-files/md/MdBlurLinear';
import { RiEye2Line } from '@react-icons/all-files/ri/RiEye2Line';
import { useState } from 'react';
import { AppStore } from '../../../AppStore';
import { config } from '../../../Shared/Config';
import { colors } from '../../../Shared/Theme';
import { StyledToolButton } from './StyledToolButton';

export const CameraTypeApp = () => {
	const [isPerspective, setterIsPerspective] = useState(config.scene.setStartupPerspectiveCamera);

	return <StyledToolButton onClick={() => {
		AppStore.sceneStore.switchCameraType(!isPerspective);
		setterIsPerspective(!isPerspective);
	}}
													 selected={false}
													 description={'change camera type to ' + (isPerspective ? 'orthographic' : 'perspective')}
													 clickColor={colors.interact.touch1}
													 hoverColor={colors.interact.neutral1}>
		{isPerspective ? <RiEye2Line transform={'scale(1.1)'}/> :
			<MdBlurLinear transform={'scale(1.1)'}/>}
	</StyledToolButton>;
};

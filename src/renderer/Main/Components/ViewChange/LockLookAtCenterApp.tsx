import { IconButton, Tooltip } from '@mui/material';
import { MdCenterFocusStrong } from '@react-icons/all-files/md/MdCenterFocusStrong';
import { MdCenterFocusWeak } from '@react-icons/all-files/md/MdCenterFocusWeak';
import { useState } from 'react';
import { AppStore } from '../../../AppStore';
import { config, saveConfig } from '../../../Shared/Config';
import { colors } from '../../../Shared/Config';

export const LockLookAtCenterApp = () => {
	const [isActive, setterIsActive] = useState(config.scene.isFixedCenter);

	return <Tooltip title={isActive ? 'look at center' : 'free look'} arrow placement="bottom"
		PopperProps={{ sx: { userSelect: 'none' } }}>
		<IconButton
			size='small'
			onClick={() => {
				config.scene.isFixedCenter = !isActive;
				setterIsActive(config.scene.isFixedCenter);
				saveConfig();
				AppStore.sceneStore.animate();
			}}>
			{isActive
				? <MdCenterFocusStrong color={colors.background.light}/>
				: <MdCenterFocusWeak color={colors.background.light}/>}
		</IconButton>
	</Tooltip>;
};

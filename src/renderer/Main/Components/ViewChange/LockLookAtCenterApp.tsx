import { IconButton, Tooltip } from '@mui/material';
import { MdCenterFocusStrong } from '@react-icons/all-files/md/MdCenterFocusStrong';
import { MdCenterFocusWeak } from '@react-icons/all-files/md/MdCenterFocusWeak';
import { observer } from 'mobx-react';
import { AppStore } from '../../../AppStore';
import { config, saveConfig } from '../../../Shared/Config';
import { colors } from '../../../Shared/Config';

export const LockLookAtCenterApp = observer(() => {
	AppStore.sceneStore.orbitControls.enablePan = !config.scene.isFixedCenter;

	return <Tooltip title={'look at center. use doubleclick to lock change'} arrow placement="bottom"
		PopperProps={{ sx: { userSelect: 'none' } }}>
		<IconButton
			size='small'
			onDoubleClick={() => {
				config.scene.isFixedCenter = !config.scene.isFixedCenter;
				saveConfig();
				AppStore.sceneStore.animate();
			}}
			onClick={() => {
				AppStore.sceneStore.orbitControls.target.set(AppStore.sceneStore.gridSize.x / 2, 0, AppStore.sceneStore.gridSize.z / 2);
				AppStore.sceneStore.animate();
			}}>
			{config.scene.isFixedCenter
				? <MdCenterFocusStrong color={colors.background.light}/>
				: <MdCenterFocusWeak color={colors.background.light}/>}
		</IconButton>
	</Tooltip>;
});

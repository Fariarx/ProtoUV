import { Box, Slider } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { AppStore } from '../../../AppStore';
import { config } from '../../../Shared/Config';

export const SliceSliderApp = observer(() => {
	const refresh = () => {
		setTimeout(() => {
			AppStore.sceneStore.clippingReset();
			AppStore.sceneStore.animate();
		},100);
	};

	return <Box sx={{
		flexGrow: 1,
		ml: 1, mt: 4
	}}>
		<Slider
			sx={{
				height:'100%',
				opacity: 0.3,
				transition: '1s all',
				':active': {
					opacity: config.ui.opacity
				}
			}}
			orientation="vertical"
			valueLabelDisplay="off"
			min={-1}
			max={100000}
			value={AppStore.sceneStore.clippingScenePercent * 100000}
			onChange={(_,n: number & any) => {
				AppStore.sceneStore.clippingScenePercent = n < 0 ? -1 : n / 100000;
				AppStore.sceneStore.animate();
				if (AppStore.sceneStore.clippingScenePercent < 0 && n >= 0)
				{
					refresh();
				}
			}}
			/*onDoubleClick={() => {
				AppStore.sceneStore.clippingSceneDirectionDown =
          !AppStore.sceneStore.clippingSceneDirectionDown;
				AppStore.sceneStore.animate();
				refresh();
			}}*/
		/>
	</Box>;
});

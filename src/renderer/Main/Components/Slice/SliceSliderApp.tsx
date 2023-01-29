import { Box, Slider } from '@mui/material';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { AppStore } from '../../../AppStore';
import { config } from '../../../Shared/Config';

export const SliceSliderApp = observer(() => {
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
			max={100001}
			value={AppStore.sceneStore.clippingScenePercent * 100000}
			onChange={(_,n: number & any) => {
				runInAction(() => {
					if (n < 0 || n > 100000)
					{
						AppStore.sceneStore.clippingSceneWorking = false;
					}
					else  {
						AppStore.sceneStore.clippingSceneWorking = true;
						AppStore.sceneStore.clippingScenePercent = n / 100000;
					}
					AppStore.sceneStore.animate();
				});
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

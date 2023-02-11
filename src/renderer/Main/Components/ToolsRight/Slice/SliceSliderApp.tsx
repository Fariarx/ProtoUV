import { Box } from '@mui/material';
import _ from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { AppStore } from '../../../../AppStore';
import { config } from '../../../../Shared/Config';
import { SliceSlider } from '../../../../Shared/Styled/Slider';
import { SceneObject } from '../../../Scene/Entities/SceneObject';

export const SliceSliderApp = observer(() => {
	if (AppStore.sceneStore.objects.length === 0)
	{
		return <Box/>;
	}

	const maxObjectsPoint =  _.maxBy(AppStore.sceneStore.objects, (x: SceneObject) => x.maxY.y);
	const sliceTo = Math.min(AppStore.sceneStore.gridSize.y, maxObjectsPoint!.maxY.y);

	return <Box sx={{
		flexGrow: 1,
		ml: 1, mt: 4
	}}>
		<SliceSlider
			sx={{
				height:'100%',
				opacity: 0.2,
				transition: '1s all',
				':active': {
					opacity: config.ui.opacity
				},
				':hover': {
					opacity: config.ui.opacity
				}
			}}
			orientation="vertical"
			valueLabelDisplay="off"
			min={0}
			max={100001}
			value={100000 * ((AppStore.sceneStore.clippingScenePercent * AppStore.sceneStore.gridSize.y) / sliceTo)}
			onChange={(_e,n: number & any) => {
				runInAction(() => {
					if (n < 0 || n > 100000)
					{
						AppStore.sceneStore.clippingSceneWorking = false;
					}
					else  {
						const percent = n / 100000;
						AppStore.sceneStore.clippingSceneWorking = true;
						AppStore.sceneStore.clippingScenePercent = (sliceTo * percent) / AppStore.sceneStore.gridSize.y;
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

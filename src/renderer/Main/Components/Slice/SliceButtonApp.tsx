import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react-lite';
import { AppStore, Log, Pages } from 'renderer/AppStore';
import { APP_BOTTOM_HEIGHT } from 'renderer/BottomApp';
import { colors } from 'renderer/Shared/Config';

export const SliceButtonApp = observer(() => {
	return <Box sx={{
		position: 'fixed',
		bottom: 10 + APP_BOTTOM_HEIGHT - 4 + 'px',
		right: '4px',
		backgroundColor: colors.background.dark,
		borderRadius: '4px',
		width: '150px',
		height: '36px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		transition: 'all 0.4',
		userSelect: 'none',
		':hover': {
			backgroundColor: colors.background.darkest
		},
		':active': {
			backgroundColor: colors.background.black
		},
		opacity: AppStore.sceneStore.objects.length > 0 ? 1 : 0
	}}  onClick={() => {
		Log('run slicing');
		AppStore.changeState(Pages.Slice);
	}}>
		<Typography>
      Slice
		</Typography>
	</Box>;
});

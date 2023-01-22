import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { AppStore, Log } from 'renderer/AppStore';
import { APP_BOTTOM_HEIGHT } from 'renderer/BottomApp';
import { colors } from 'renderer/Shared/Config';
import { Job, WorkerType } from 'renderer/Shared/Libs/Slice/Job';
import { SliceResult } from 'renderer/Shared/Libs/Slice/Slice';
import { addJob } from 'renderer/Shared/Libs/Slice/Workers';

export const SliceButtonApp = observer(() => {
	return <Box sx={{
		position: 'fixed',
		bottom: APP_BOTTOM_HEIGHT - 4 + 'px',
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
		}
	}}  onClick={() => {
		let _percent = 0;
		Log('run slicing');
		addJob(new Job({
			name: WorkerType.SliceFullScene,
			onResult: (result: SliceResult[]) => {
				Log('slicing done');
			},
			onState: (percent: number) => {
				if (Math.ceil(percent * 100) !== _percent) {
					_percent = Math.ceil(percent * 100);
					Log('slicing: ' + _percent + ' %');
				}
			}
		}));
	}}>
		<Typography sx={{ mb: '4px' }}>
      Slice
		</Typography>
	</Box>;
});

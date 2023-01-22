import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react-lite';
import { APP_BOTTOM_HEIGHT } from 'renderer/BottomApp';
import { colors } from 'renderer/Shared/Config';
import { Job, WorkerType } from 'renderer/Shared/Libs/Slice/Job';
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
	}}>
		<Typography sx={{ mb: '4px' }} onClick={() => {
			addJob(new Job({
				name: WorkerType.SliceFullScene,
				onResult: result => {
					console.log(result);
				},
				onState: percent => {
					console.log(percent);
				}
			}));
		}}>
      Slice
		</Typography>
	</Box>;
});

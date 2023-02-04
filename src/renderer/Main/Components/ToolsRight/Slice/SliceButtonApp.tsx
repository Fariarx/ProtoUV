import { Box, styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react-lite';
import { AppStore, Log, Pages } from '../../../../AppStore';
import { colors } from '../../../../Shared/Config';
import { Sizes } from '../../../../Shared/Styled/Sizes';

export const SliceButtonApp = observer(() => {
	return <BigButton sx={{
		display: AppStore.sceneStore.objects.length > 0 ? 'flex' : 'none',
		border: '1px solid ' + colors.interact.touch1,
		borderRadius: Sizes.four + ' 0' + ' 0 ' + Sizes.four,
		borderRight: 'unset',
		width: '100%',
		mt: 1
	}}  onClick={() => {
		Log('run slicing');
		AppStore.changeState(Pages.Slice);
	}}>
		<Typography>
      Slice
		</Typography>
	</BigButton>;
});

export const BigButton = styled(Box)(() => ({
	backgroundColor: colors.background.heavy,
	borderRadius: '4px',
	width: '150px',
	height: '36px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	transition: 'all 0.4s',
	userSelect: 'none',
	paddingLeft: '12px', paddingRight: '12px',
	':hover': {
		backgroundColor: colors.background.darkest
	},
	':active': {
		backgroundColor: colors.background.black
	},
}));

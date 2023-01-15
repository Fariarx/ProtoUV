import { Box } from '@mui/material';
import { MdAddCircleOutline } from '@react-icons/all-files/Md/MdAddCircleOutline';
import { MdRemoveCircleOutline } from '@react-icons/all-files/Md/MdRemoveCircleOutline';
import { observer } from 'mobx-react-lite';
import { colors } from 'renderer/Shared/Config';
import { Sizes } from 'renderer/Shared/Styled/Sizes';
import { ToolButton } from './Shared/ToolButton';

export const PerformSupportsApp = observer(() => {

	return <Box sx={{
		width: '100%',
		height: '100px',
		padding: '8px',
		border: '1px solid ' + colors.background.darkest,
		borderRight: 'unset',
		backgroundColor: colors.background.common,
		borderRadius: Sizes.four + ' 0' + ' 0 ' + Sizes.four,
		display: 'flex',
		gap: 0.5,
		mt: 1,
	}}>
		<ToolButton>
			<MdAddCircleOutline transform='scale(1.1)' color={colors.background.light}/>
		</ToolButton>
		<ToolButton>
			<MdRemoveCircleOutline transform='scale(1.1)' color={colors.background.light}/>
		</ToolButton>
	</Box>;
});

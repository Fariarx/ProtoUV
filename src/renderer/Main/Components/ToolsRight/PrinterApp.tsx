import { Box, Typography } from '@mui/material';
import { MdEdit } from '@react-icons/all-files/md/MdEdit';
import { observer } from 'mobx-react-lite';
import { AppStore, Log, Pages } from 'renderer/AppStore';
import { colors } from 'renderer/Shared/Config';
import { SupportsEnum } from 'renderer/Shared/Libs/Types';
import { Sizes } from 'renderer/Shared/Styled/Sizes';
import { ToolButton } from './Supports/Shared/ToolButton';

export const PrinterApp = observer(() => {

	return <Box sx={{
		width: '100%',
		height: 'fit-content',
		padding: '4px',
		paddingLeft: 1,
		border: '1px solid ' + colors.background.darkest,
		borderRight: 'unset',
		backgroundColor: colors.background.dark,
		borderRadius: Sizes.four + ' 0' + ' 0 ' + Sizes.four,
		mt: 1,
	}}>
		<Box sx={{
			display: 'flex',
			gap: 0.5,
		}}>
			<Typography sx={{
				width: '100%',
				fontSize: '16px'
			}}>
				{AppStore.sceneStore.printerName}
			</Typography>
			<ToolButton
				text='edit printer'
				isActive={false}
				placement='left'
				onClick={() => AppStore.changeState(Pages.Configurator)}>
				<MdEdit transform='scale(1.1)' color={colors.background.light}/>
			</ToolButton>
		</Box>
	</Box>;
});

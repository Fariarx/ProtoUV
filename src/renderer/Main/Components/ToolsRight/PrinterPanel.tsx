import { Box, Typography } from '@mui/material';
import { HiSwitchHorizontal } from '@react-icons/all-files/hi/HiSwitchHorizontal';
import { MdEdit } from '@react-icons/all-files/md/MdEdit';
import { observer } from 'mobx-react-lite';
import { AppStore, Pages } from 'renderer/AppStore';
import { colors } from 'renderer/Shared/Config';
import { Sizes } from 'renderer/Shared/Styled/Sizes';
import { ToolButton } from './Supports/Shared/ToolButton';

export const PrinterPanel = observer(() => {

	return <Box sx={{
		width: '100%',
		height: 'fit-content',
		padding: '4px',
		paddingLeft: 1,
		border: '1px solid ' + colors.background.darkest,
		borderRadius: Sizes.four + ' 0' + ' 0 ' + Sizes.four,
		borderRight: 'unset',
		backgroundColor: colors.background.dark,
		userSelect: 'none',
		mt: 1,
	}}>
		<Box sx={{
			display: 'flex',
			gap: 0.5,
		}}>
			<Typography sx={{
				width: '100%',
				fontSize: '14px',
				mt: '1px', ml: '2px'
			}}>
				{AppStore.sceneStore.printerName}
			</Typography>
			<ToolButton
				text='edit printer'
				isActive={false}
				placement='bottom'
				borderColor={AppStore.sceneStore.printer?.Name === 'Default Printer' ? colors.interact.warning : undefined}
				onClick={() => AppStore.sceneStore.isOpenPrinterEditor = true}>
				<MdEdit transform='scale(1.1)' color={colors.background.light}/>
			</ToolButton>
			<ToolButton
				text='change printer'
				isActive={false}
				placement='bottom'
				onClick={() => AppStore.changeState(Pages.Configurator)}>
				<HiSwitchHorizontal transform='scale(1.1)' color={colors.background.light}/>
			</ToolButton>
		</Box>
	</Box>;
});

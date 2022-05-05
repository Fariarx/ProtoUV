import {
	Box,
	ButtonGroup,
	IconButton, Typography,
	styled
} from '@mui/material';
import { BsCircleFill } from '@react-icons/all-files/bs/BsCircleFill';
import { colors } from './Shared/Colors';
import { AppName, Bridge } from './Shared/Globals';
import { FlexBoxRow } from './Shared/Styled/FlexBox';

export const Header = () => (
	<Box onDoubleClick={Bridge.window.maximize}
		sx={{
			width: '100%',
			height: '28px',
			background: colors.background.dark,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'flex-end',
		}}>
		<Box
			sx={{
				width: '100%',
				height: '100%',
				'-webkit-app-region': 'drag'
			}}>
			<FlexBoxRow>
				<Typography variant={'subtitle2'} sx={{
					flex:'auto',
					marginLeft: '12px',
					color: colors.background.white,
					alignSelf:'center',
					justifySelf: 'center',
					textShadow: '1px 1px 2px ' + colors.interact.touch
				}}>
					{AppName}
				</Typography>
			</FlexBoxRow>
		</Box>
		<ButtonGroup size="small" aria-label="small button group">
			<IconButtonSmall onClick={Bridge.window.maximize}>
				<BsCircleFill color={colors.interact.touch} />
			</IconButtonSmall>
			<IconButtonSmall onClick={Bridge.window.minimize}>
				<BsCircleFill color={colors.interact.warning} />
			</IconButtonSmall>
			<IconButtonSmall onClick={Bridge.window.close}>
				<BsCircleFill color={colors.interact.danger} />
			</IconButtonSmall>
		</ButtonGroup>
	</Box>
);

const IconButtonSmall = styled(IconButton)({
	width: '28px'
});

import {
	Box,
	ButtonGroup,
	IconButton, Typography,
	styled
} from '@mui/material';
import { BsCircleFill } from '@react-icons/all-files/bs/BsCircleFill';
import { colors } from './Shared/Colors';
import { Bridge } from './Shared/Globals';
import { FlexBoxRow } from './Shared/Styled/FlexBox';

export const Header = () => (
	<Box onDoubleClick={Bridge.window.maximize}
		sx={{
			width: '100%',
			height: '36px',
			background: colors.greyscale.mega,
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
					color: colors.greyscale.white,
					alignSelf:'center',
					textShadow: '1px 1px 2px ' + colors.interact.touch
				}}>
        UV Proto
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

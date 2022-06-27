import {
	Box,
	ButtonGroup,
	IconButton,
	MenuItem, Typography, styled
} from '@mui/material';
import { GoLogoGithub } from '@react-icons/all-files/go/GoLogoGithub';
import { VscChromeClose } from '@react-icons/all-files/vsc/VscChromeClose';
import { VscChromeMaximize } from '@react-icons/all-files/vsc/VscChromeMaximize';
import { VscChromeMinimize } from '@react-icons/all-files/vsc/VscChromeMinimize';
import { observer } from 'mobx-react';
import React from 'react';
import { BindItem, HeaderStore } from './HeaderStore';
import { colors } from './Shared/Colors';
import { Bridge } from './Shared/Globals';
import logo from './Shared/Image/uv32px.png';
import { emptyFunc, linearGenerator } from './Shared/Libs/Tools';
import { FlexBoxRow } from './Shared/Styled/FlexBox';
import { Sizes } from './Shared/Styled/Sizes';
import { StyledMenu } from './Shared/Styled/StyledMenu';

export const APP_HEADER_HEIGHT = '26px';

export const HeaderApp = observer(() => {
	const store = new HeaderStore();

	return (
		<Box sx={{
			width: '100%',
			height: APP_HEADER_HEIGHT,
			background: colors.background.dark,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'flex-end',
			userSelect: 'none',
		}}>
			<img
				src={logo}
				style={{
					width: Sizes.sixteen,
					height: Sizes.sixteen,
					marginTop: Sizes.four,
					marginLeft: Sizes.four,
					border: '1px solid',
					borderRadius: '25%'
				}}
			/>
			<FlexBoxRow sx={{ width: 'fit-content', marginLeft: Sizes.four }}>
				<MenuHeaderItem name={'File'} store={store} binds={[{
					name: 'Open',
					func: emptyFunc
				},{
					name: 'Save',
					func: emptyFunc
				}]}/>
				<MenuHeaderItem name={'Help'} store={store} binds={[{
					name: 'About',
					func: emptyFunc
				}]}/>
			</FlexBoxRow>
			<FlexBoxRow
				onDoubleClick={Bridge.window.maximize}
				sx={{
					width: '100%',
					height: '100%',
					'-webkit-app-region': 'drag',
				}}>
			</FlexBoxRow>
			<IconButtonSmall sx={{
				marginRight: Sizes.twentyFour,
				borderRadius: Sizes.four,
				marginTop: Sizes.four,
				marginBottom: Sizes.four,
				color: colors.typography.background
			}}>
				<GoLogoGithub transform={'scale(2)'}/>
			</IconButtonSmall>
			<ButtonGroup >
				<IconButtonSmall onClick={Bridge.window.minimize} sx={{
					borderRadius: 0,
					width: Sizes.multiply(Sizes.twentyFour, 1.5)
				}}>
					<VscChromeMinimize color={colors.typography.background} transform={'scale(0.8)'}/>
				</IconButtonSmall>
				<IconButtonSmall onClick={Bridge.window.maximize} sx={{
					borderRadius: 0,
					width: Sizes.multiply(Sizes.twentyFour, 1.5)
				}}>
					<VscChromeMaximize color={colors.typography.background} transform={'scale(0.8)'}/>
				</IconButtonSmall>
				<IconButtonSmall onClick={Bridge.window.close} sx={{
					'&:hover':{
						backgroundColor: colors.interact.danger,
						color: colors.background.white
					},
					borderRadius: 0,
					width: Sizes.multiply(Sizes.twentyFour, 1.5)
				}}>
					<VscChromeClose color={colors.typography.background} transform={'scale(0.8)'}/>
				</IconButtonSmall>
			</ButtonGroup>
		</Box>
	);
});

const MenuHeaderItem = observer((props: {name: string, store: HeaderStore, binds: BindItem[]}) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const name = props.name;
	const store = props.store;
	const menuItem = store.setupMenuItemBinds(name, props.binds);
	const isOpen = menuItem?.isOpen;

	return <>
		<FlexBoxRow ref={setAnchorEl} onClick={() => store.setMenuItemOpen(name)} sx={{
			paddingLeft: Sizes.eight,
			paddingRight: Sizes.eight,
			bgcolor: isOpen ? colors.interact.touch : 'unset',
			'&:hover': {
				bgcolor: isOpen ? colors.interact.touch : colors.background.commonLight
			}
		}} >
			<Typography variant={'body2'} sx={{
				flex:'auto',
				alignSelf:'center',
				justifySelf: 'center',
				fontFamily: 'sans-serif',
				fontSize: Sizes.twelve,
				color: colors.typography.background,
				userSelect: 'none',
			}}>
				{name}
				<Box sx={{
					width: Sizes.eight,
					height: '1px',
					marginTop: '-4px',
					backgroundColor: colors.typography.background
				}}/>
			</Typography>
		</FlexBoxRow>
		<StyledMenu autoFocus
			variant={'menu'}
			open={isOpen && Boolean(anchorEl) && props.binds.length !== 0}
			anchorEl={anchorEl} >
			{props.binds.map(x => <MenuItem key={linearGenerator.next().value} sx={{
				fontSize: Sizes.twelve,
			}} onClick={x.func}>
				{x.name}
			</MenuItem>)}
		</StyledMenu>
	</>;
});

const IconButtonSmall = styled(IconButton)({
	width: '28px'
});

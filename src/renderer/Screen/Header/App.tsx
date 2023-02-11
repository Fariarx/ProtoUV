import 'reflect-metadata';
import { Box, ButtonGroup, IconButton, MenuItem, Typography, styled } from '@mui/material';
import { VscChromeClose } from '@react-icons/all-files/vsc/VscChromeClose';
import { VscChromeMaximize } from '@react-icons/all-files/vsc/VscChromeMaximize';
import { VscChromeMinimize } from '@react-icons/all-files/vsc/VscChromeMinimize';
import { observer } from 'mobx-react';
import React from 'react';
import { container } from 'tsyringe';
import { BindItem, HeaderStore } from './Store';
import { AppStore, Pages } from '../../AppStore';
import { colors } from '../../Shared/Config';
import { AppLink, bridge } from '../../Shared/Globals';
import logo1 from '../../Shared/Image/uv128_v1.png';
import { linearGenerator } from '../../Shared/Libs/Tools';
import { AnimationGrow } from '../../Shared/Styled/Animation';
import { FlexBoxRow, FlexBoxRowFit } from '../../Shared/Styled/FlexBox';
import { Sizes } from '../../Shared/Styled/Sizes';
import { StyledMenu } from '../../Shared/Styled/StyledMenu';

export const APP_HEADER_HEIGHT = 26;
export const APP_HEADER_HEIGHT_PX = APP_HEADER_HEIGHT + 'px';

export const HeaderApp = observer(() => {
	const store = container.resolve(HeaderStore);

	return <Box sx={{
		width: '100%',
		height: APP_HEADER_HEIGHT_PX,
		background: colors.background.dark,
		position: 'absolute',
		borderBottom: '1px solid ' + colors.background.darkest,
		zIndex: '999999999'
	}}>
		<Box sx={{
			width: '100%',
			height: '100%',
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'flex-end',
			userSelect: 'none',
		}}>
			<FlexBoxRowFit>
				<Typography variant={'subtitle2'} sx={{
					marginTop: Sizes.three,
					marginLeft: Sizes.eight,
					color: colors.background.white,
					textShadow: '1px 1px 2px ' + colors.logo.main
				}}>
        Proto
				</Typography>
				<LogoIcon/>
			</FlexBoxRowFit>
			<AnimationGrow in={AppStore.getState() === Pages.Main}>
				<FlexBoxRow sx={{ width: 'fit-content' }}>
					<FlexBoxRow sx={{ width: 'fit-content', marginLeft: Sizes.eight }}>
						<MenuHeaderItem name={'File'} store={store} binds={[{
							name: 'Open',
							func: () => { bridge.openFileDialog().filePaths.forEach((filePath: string) =>
								AppStore.sceneStore.handleLoadFile(filePath)); }
						}]}/>
						<MenuHeaderItem name={'Help'} store={store} binds={[{
							name: 'Open settings folder',
							func: () => bridge.shell.openPath(bridge.userData())
						}, {
							name: 'About',
							func: () => bridge.shell.openExternal(AppLink)
						}]}/>
					</FlexBoxRow>
				</FlexBoxRow>
			</AnimationGrow>
			<FlexBoxRow
				onDoubleClick={bridge.maximize}
				sx={{
					width: '100%',
					height: '100%',
					'-webkit-app-region': 'drag',
				}}>
			</FlexBoxRow>
			<ButtonGroup >
				<IconButtonSmall onClick={bridge.minimize} sx={{
					borderRadius: 0,
					width: Sizes.multiply(Sizes.twentyFour, 1.5)
				}}>
					<VscChromeMinimize color={colors.typography.background} transform={'scale(0.8)'}/>
				</IconButtonSmall>
				<IconButtonSmall onClick={bridge.maximize} sx={{
					borderRadius: 0,
					width: Sizes.multiply(Sizes.twentyFour, 1.5)
				}}>
					<VscChromeMaximize color={colors.typography.background} transform={'scale(0.8)'}/>
				</IconButtonSmall>
				<IconButtonSmall onClick={bridge.close} sx={{
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
	</Box>;
});

const MenuHeaderItem = observer((props: {name: string, store: HeaderStore, binds: BindItem[]}) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const name = props.name;
	const store = props.store;
	const menuItem = store.setupMenuItemBinds(name, props.binds);
	const isOpen = menuItem?.isOpen;

	return <Box>
		<FlexBoxRow ref={setAnchorEl} onClick={() => store.setMenuItemOpen(name)} sx={{
			paddingLeft: Sizes.eight,
			paddingRight: Sizes.eight,
			bgcolor: isOpen ? colors.interact.neutral : 'unset',
			'&:hover': {
				bgcolor: isOpen ? colors.interact.neutral : colors.background.commonest
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
		<StyledMenu disableAutoFocusItem
			variant={'menu'}
			open={isOpen && Boolean(anchorEl) && props.binds.length !== 0}
			anchorEl={anchorEl} >
			{props.binds.map(x => <MenuItem key={linearGenerator.next().value} sx={{
				fontSize: Sizes.twelve,
			}} onClick={x.func}>
				{x.name}
			</MenuItem>)}
		</StyledMenu>
	</Box>;
});

const IconButtonSmall = styled(IconButton)({
	width: '28px'
});

const LogoIcon = () => <img
	src={logo1}
	style={{
		width: '18px',
		height: '18px',
		marginTop: '4px',
	}}
/>;

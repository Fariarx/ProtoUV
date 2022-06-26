import {
	Box,
	ButtonGroup,
	IconButton, Typography,
	styled
} from '@mui/material';
import { VscChromeClose } from '@react-icons/all-files/vsc/VscChromeClose';
import { VscChromeMaximize } from '@react-icons/all-files/vsc/VscChromeMaximize';
import { VscChromeMinimize } from '@react-icons/all-files/vsc/VscChromeMinimize';
import { observer } from 'mobx-react';
import React, { useRef } from 'react';
import { colors } from '../Shared/Colors';
import { Bridge } from '../Shared/Globals';
import logo from '../Shared/Image/uv32px.png';
import { FlexBoxRow } from '../Shared/Styled/FlexBox';
import { Sizes } from '../Shared/Styled/Sizes';
import { HeaderStore } from './HeaderStore';

export const APP_HEADER_HEIGHT = '26px';

export const HeaderApp = () => {
	const store = new HeaderStore();

	return (
		<Box sx={{
			width: '100%',
			height: APP_HEADER_HEIGHT,
			background: colors.background.heavy,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'flex-end',
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
				<HeaderItem name={'File'} store={store}/>
				<HeaderItem name={'Edit'} store={store}/>
				<HeaderItem name={'Help'} store={store}/>
			</FlexBoxRow>
			<Box
				onDoubleClick={Bridge.window.maximize}
				sx={{
					width: '100%',
					height: '100%',
					'-webkit-app-region': 'drag',
				}}>
			</Box>
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
};

const HeaderItem = observer((props: {name: string, store: HeaderStore}) => {
	const name = props.name;
	const menu = props.store.menu;
	const menuItem = (menu.has(name) ? menu : menu.set(name, {
		isOpen: false,
		clickTime: Date.now()
	})).get(name)!;

	return <FlexBoxRow onClick={() => {
		menuItem.isOpen = !menuItem.isOpen;
	}} sx={{
		paddingLeft: Sizes.eight,
		paddingRight: Sizes.eight,
		bgcolor: menuItem?.isOpen ? colors.interact.touch : 'unset'
	}} >
		<Typography variant={'body2'} sx={{
			flex:'auto',
			alignSelf:'center',
			justifySelf: 'center',
			fontFamily: 'sans-serif',
			fontSize: Sizes.twelve,
			color: colors.typography.background,
			userSelect: 'none',
			'&:hover': {
				color: menuItem?.isOpen ? colors.typography.background
					: colors.background.superLight
			}
		}}>
			{name}
			<Box sx={{
				width: Sizes.eight,
				height: '1px',
				marginTop: '-4px',
				backgroundColor: colors.typography.background
			}}/>
		</Typography>
	</FlexBoxRow>;
});

const IconButtonSmall = styled(IconButton)({
	width: '28px'
});

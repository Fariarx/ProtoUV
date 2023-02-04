import { Box, Tooltip, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import React from 'react';
import { AppStore } from './AppStore';
import { colors } from './Shared/Config';
import {  AppLinkReleases, AppVersion, bridge } from './Shared/Globals';
import { FlexBoxColumn, FlexBoxRow } from './Shared/Styled/FlexBox';
import { Sizes } from './Shared/Styled/Sizes';

export const APP_BOTTOM_HEIGHT = 24;
export const APP_BOTTOM_HEIGHT_PX =  Sizes.twentyFour;

export const LineBottomApp = observer(() => {
	const app = AppStore.instance;

	return <FlexBoxColumn sx={{
		position: 'absolute',
		height: APP_BOTTOM_HEIGHT_PX,
		bottom: 0,
		userSelect: 'none'
	}}>
		{app.progressPercent > 0 && <Box sx={{
			position: 'absolute',
			bottom: 0, left: 0,
			height: '100%',
			width: app.progressPercent * 100 + '%',
			opacity: 0.5,
			borderRight: '1px solid '+ colors.background.darkest,
			backgroundColor: app.progressPercent >= 1
				? colors.interact.success : colors.interact.neutral2,
			transition: '1s background',
			pointerEvents: 'none'
		}}/>}
		{app.progressPercent > 0 && <Box sx={{
			position: 'absolute',
			bottom: 0, left: 0,
			height: '100%',
			opacity: 0.8,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'start',
			pl: 1,fontSize: '12px',
		}}>
			{Math.round(app.progressPercent * 100)}%
		</Box>}
		<FlexBoxRow sx={{
			background: colors.background.dark,
			justifyContent: 'flex-end',
			borderTop: '1px solid ' + colors.background.darkest
		}}>
			<Typography variant={'body2'} sx={{
				minWidth: 'max-content',
				backgroundColor: colors.background.commonest,
				border: '1px solid ' + colors.background.warm,
				pl: AppStore.instance.newVersion ? 0 : '4px', pr: '4px', pb: '1px', mr: '6px',
				height: '18px',
				width:'fit-content',
				borderRadius: '2px',
				alignSelf: 'center',
				justifySelf: 'center',
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				fontFamily: 'sans-serif',
				fontSize: Sizes.twelve,
				color: colors.typography.background,
			}} onClick={() => bridge.shell.openExternal(AppLinkReleases)}>
				{AppStore.instance.newVersion ? <>
					<img src={`data:image/svg+xml;base64,${
						btoa(unescape(encodeURIComponent(AppStore.instance.newVersion)))}`
					} alt="" style={{
						height: '18px',
						alignSelf: 'center',
						justifySelf: 'center',
						marginRight: '4px'
					}} />
            update found, now is {AppVersion}
				</> : AppVersion }
			</Typography>
			<Text>
				{'Project directory: '} {/*Директория первого файла*/}
				<span style={{ fontWeight: 'bold', display: 'inline-flex' }}>
					{app.projectFolder
						? <Tooltip title="Double click to open" arrow>
							<Box onDoubleClick={() => bridge.shell.openPath(app.projectFolder!)}>
								{' '}{app.projectFolder?.split('\\').pop()}
							</Box>
						</Tooltip>
						: '*folder name*'}
				</span>
			</Text>
			<Text>
				<span style={{ fontWeight: 'bold' }}>{app.fileCount}</span>
				{' file(-s)'}
			</Text>
		</FlexBoxRow>
	</FlexBoxColumn>;
});

const Text = ({ children }: {
  children: React.ReactNode;
}) => {
	return <Typography variant={'body2'} sx={{
		flex:'auto',
		alignSelf:'center',
		justifySelf: 'center',
		fontFamily: 'sans-serif',
		marginRight: Sizes.sixteen,
		color: colors.typography.background,
		fontSize: Sizes.twelve,
		maxWidth: 'fit-content',
		marginTop: '-3px'
	}}>
		{children}
		<Box sx={{
			width: Sizes.eight,
			height: '1px',
			marginTop: '-4px',
			backgroundColor: colors.typography.background
		}}/>
	</Typography>;
};

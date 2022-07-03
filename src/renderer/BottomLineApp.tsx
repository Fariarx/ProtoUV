import { Box, Divider, Tooltip, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { AppStore } from './AppStore';
import { colors } from './Shared/Colors';
import { bridge } from './Shared/Globals';
import { FlexBoxColumn, FlexBoxRow } from './Shared/Styled/FlexBox';
import { Sizes } from './Shared/Styled/Sizes';

export const BottomLineApp = observer(() => {
	const app = AppStore.getInstance();

	return <FlexBoxColumn sx={{
		position: 'absolute',
		height: Sizes.twentyFour,
		bottom: 0,
		opacity: 0.5,
		userSelect: 'none',
	}}>
		<Divider />
		<FlexBoxRow sx={{
			background: colors.background.dark,
			justifyContent: 'flex-end',
		}}>
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

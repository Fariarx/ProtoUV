import { Box, Typography } from '@mui/material';
import { colors } from './Shared/Colors';
import { FlexBoxRow } from './Shared/Styled/FlexBox';
import { Sizes } from './Shared/Styled/Sizes';

export const BottomLineApp = () => {
	return <FlexBoxRow sx={{
		width: '100%',
		height: Sizes.twentyFour,
		justifyContent: 'flex-end',
	}}>
		<Text>
			{'Project directory: '} {/*Директория первого файла*/}
			<span style={{ fontWeight: 'bold' }}>*folder name*</span>
		</Text>
		<Text>
			<span style={{ fontWeight: 'bold' }}>0</span>
			{' file(-s)'}
		</Text>
	</FlexBoxRow>;
};

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
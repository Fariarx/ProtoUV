import { Box, styled } from '@mui/material';

export const FlexBox = styled(Box)({
	display: 'flex',
	width: '100%',
	height: '100%'
});
export const FlexBoxRow = styled(Box)({
	display: 'flex',
	flexDirection: 'row',
	width: '100%',
	height: '100%'
});
export const FlexBoxColumn = styled(Box)({
	display	: 'flex',
	flexDirection: 'column',
	width: '100%',
	height: '100%'
});
export const flexChildrenCenter = {
	alignItems: 'center',
	justifyContent: 'center'
};

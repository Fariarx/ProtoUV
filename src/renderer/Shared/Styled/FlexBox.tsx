import { Box, styled } from '@mui/material';

export const FlexBox = styled(Box)({
	display: 'flex',
	width: '100%',
	height: '100%'
});
export const FlexBoxRowFit = styled(Box)({
	display	: 'flex',
	flexDirection: 'row',
});
export const FlexBoxRow = styled(FlexBoxRowFit)({
	width: '100%',
	height: '100%'
});
export const FlexBoxColumnFit = styled(Box)({
	display	: 'flex',
	flexDirection: 'column',
});
export const FlexBoxColumn = styled(FlexBoxColumnFit)({
	width: '100%',
	height: '100%'
});
export const flexChildrenCenter = {
	alignItems: 'center',
	justifyContent: 'center'
};
export const flexSelfCenter = {
	alignSelf: 'center',
	justifySelf: 'center'
};

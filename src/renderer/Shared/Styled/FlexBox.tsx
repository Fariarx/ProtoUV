import { Box, styled } from '@mui/material';
import { createRef, useEffect } from 'react';

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

export const RisizibleFlexBox = (props: {
  children: JSX.Element[] | JSX.Element | any;
  flexBoxProps: any;
  onResize: (width: number, height: number) => void;
}) => {
	const ref = createRef();

	useEffect(() => {
		(ref?.current as any).addEventListener('resize', (event: any) => props.onResize(event.detail.width, event.detail.height));
		const observer = new MutationObserver(checkResize);
		observer.observe(ref?.current as any, { attributes: true, attributeOldValue: true, attributeFilter: ['style'] });
	}, [ref]);
	const checkResize = (mutations: any) => {
		const el = mutations[0].target;
		const w = el.clientWidth;
		const h = el.clientHeight;

		const isChange = mutations
			.map((m: any) => `${m.oldValue}`)
			.some((prev: any) => prev.indexOf(`width: ${w}px`) === -1 || prev.indexOf(`height: ${h}px`) === -1);

		if (!isChange) { return; }
		const event = new CustomEvent('resize', { detail: { width: w, height: h } });
		el.dispatchEvent(event);
	};

	return <FlexBox ref={ref} {...props.flexBoxProps}>
		{props.children}
	</FlexBox>;
};

import { Fade, FadeProps, styled } from '@mui/material';

export const FadeUnmount = styled((props: FadeProps) => (
	<Fade
		mountOnEnter
		unmountOnExit
		{...props}
	/>
))();

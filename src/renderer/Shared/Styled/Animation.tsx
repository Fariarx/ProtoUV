import { Fade, FadeProps, Grow, GrowProps, styled } from '@mui/material';

export const AnimationGrow = styled((props: GrowProps & { unmount?: boolean }) => (
	<Grow
		mountOnEnter={props.unmount === undefined ? true : props.unmount}
		unmountOnExit={props.unmount === undefined ? true : props.unmount}
		addEndListener={(e) => e.style.display = !props.in ? 'none' : 'unset'}
		style={{
			transitionDelay: '500ms'
		}}
		timeout={{
			enter: 800,
			exit: 0
		}}
		{...props}
	/>
))();

export const AnimationFade = styled((props: FadeProps & { unmount?: boolean }) => (
	<Fade
		mountOnEnter={props.unmount === undefined ? true : props.unmount}
		unmountOnExit={props.unmount === undefined ? true : props.unmount}
		addEndListener={(e) => e.style.display = !props.in ? 'none' : 'unset'}
		style={{
			transitionDelay: '500ms'
		}}
		timeout={{
			enter: 500,
			exit: 0
		}}
		{...props}
	/>
))();

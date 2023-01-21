import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { AppStore } from 'renderer/AppStore';
import { SubscribersMouseDown, SubscribersMouseMove, SubscribersMouseUp } from 'renderer/Shared/Libs/Listerners';
import { SupportsEnum } from 'renderer/Shared/Libs/Types';

export const SupportsRemoveCircleApp = observer(() => {
	const position = useState({ x:0, y:0 });
	const isPressed = useState(false);
	const isWorks = () => AppStore.performSupports.state === SupportsEnum.Remove;

	useEffect(() => {
		SubscribersMouseUp.push(e => {
			if (isWorks()) {
				isPressed[1](false);
			}
		});
		SubscribersMouseDown.push(e => {
			if (isWorks()) {
				isPressed[1](true);
			}
		});
		SubscribersMouseMove.push(e => {
			if (isWorks()) {
				position[1]({
					x: e.clientX,
					y: e.clientY
				});
			}
		});
	}, []);

	return <Box sx={{
		display: isWorks() ? 'unset' : 'none',
		width: '12px',
		height: '12px',
		position: 'fixed',
		pointerEvents: 'none',
		borderRadius: '50%',
		border: '1px solid black',
		transition: 'color 0.5s',
		backgroundColor: isPressed[0] ? '#FF000042' : 'unset',
		transform: 'translateY('+(position[0].y - 6) +'px) ' + 'translateX('+(position[0].x- 6)+'px)'
	}}>

	</Box>;
});

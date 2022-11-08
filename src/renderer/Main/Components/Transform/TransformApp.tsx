import { Box,Grow,Popper } from '@mui/material';
import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { observer } from 'mobx-react';
import { colors } from 'renderer/Shared/Config';
import { Sizes } from 'renderer/Shared/Styled/Sizes';
import { container } from 'tsyringe';
import { TransformEnum } from '../../../Shared/Libs/Types';
import { ToolButtonStyled } from '../ToolsLeft/ToolButtonStyled';
import { TransformStore } from './TransformStore';

const scale = 'scale(1.1)';

export const TransformApp = observer(() => {
	const store = container.resolve(TransformStore);
	const action = (event: any, action: TransformEnum) => {
		store.changeState(action);
		store.anchorElement = store.state !== TransformEnum.None
			? event.currentTarget
			: null;
	};

	return <>
		<ToolButtonStyled description={'move'}
			mini={store.state !== TransformEnum.Move}
			selected={store.state === TransformEnum.Move}
			onClick={e => action(e, TransformEnum.Move)}
			sx={{ borderRadius: store.state === TransformEnum.Move ? '0px 8px 8px 0px' : '0px 8px 0px 0px' }}>
			<BsArrowsMove transform={scale}/>
		</ToolButtonStyled>
		<ToolButtonStyled description={'rotate'}
			mini={store.state !== TransformEnum.Rotate}
			selected={store.state === TransformEnum.Rotate}
			onClick={e => action(e, TransformEnum.Rotate)}
			sx={{ borderRadius: store.state === TransformEnum.Rotate ? '0px 8px 8px 0px' : 'unset' }}>
			<Md3DRotation transform={scale}/>
		</ToolButtonStyled>
		<ToolButtonStyled description={'scale'}
			mini={store.state !== TransformEnum.Scale}
			selected={store.state === TransformEnum.Scale}
			onClick={e => action(e, TransformEnum.Scale)}
			sx={{ borderRadius: store.state === TransformEnum.Scale ? '0px 8px 8px 0px' : '0px 0px 8px 0px' }}>
			<FiCode transform={scale}/>
		</ToolButtonStyled>
		<Popper open={!!store.anchorElement} anchorEl={store.anchorElement} placement='right-start'>
			<Grow in>
				<Box sx={{
					borderRadius: Sizes.eight,
					border: '1px solid ' + colors.background.darkest,
					p: 1,
					bgcolor: colors.background.heavy,
					marginLeft: Sizes.sum(Sizes.twentyFour, '-4px')
				}}>
          The content of the Popper.
				</Box>
			</Grow>
		</Popper>
	</>;
});


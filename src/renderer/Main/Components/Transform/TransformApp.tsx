import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { observer } from 'mobx-react';
import { container } from 'tsyringe';
import { TransformEnum } from '../../../Shared/Libs/Types';
import { ToolButtonStyled } from '../ToolButtonStyled';
import { TransformStore } from './TransformStore';

const scale = 'scale(1.1)';

export const TransformApp = observer(() => {
	const store = container.resolve(TransformStore);

	return <>
		<ToolButtonStyled description={'move'}
			mini={store.state !== TransformEnum.Move}
			selected={store.state === TransformEnum.Move}
			onClick={() => store.changeState(TransformEnum.Move)}>
			<BsArrowsMove transform={scale}/>
		</ToolButtonStyled>
		<ToolButtonStyled description={'rotate'}
			mini={store.state !== TransformEnum.Rotate}
			selected={store.state === TransformEnum.Rotate}
			onClick={() => store.changeState(TransformEnum.Rotate)}>
			<Md3DRotation transform={scale}/>
		</ToolButtonStyled>
		<ToolButtonStyled description={'scale'}
			mini={store.state !== TransformEnum.Scale}
			selected={store.state === TransformEnum.Scale}
			onClick={() => store.changeState(TransformEnum.Scale)}>
			<FiCode transform={scale}/>
		</ToolButtonStyled>
	</>;
});


import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { observer } from 'mobx-react';
import { FlexBoxRowFit } from 'renderer/Shared/Styled/FlexBox';
import { container } from 'tsyringe';
import { AppStore } from '../../../../AppStore';
import { TransformEnum } from '../../../../Shared/Libs/Types';
import { TransformPopover } from './TransformPopover';
import { TransformStore } from './TransformStore';

const scale = 'scale(1.1)';

export const TransformApp = observer(() => {
	const  store = container.resolve(TransformStore);

	return <>
		<FlexBoxRowFit sx={{
			userSelect: 'none',
			height: 'fit-content',
			width: 'fit-content',
		}}>
			<TransformPopover store={store} tool={TransformEnum.Move} description={'move'} icon={<BsArrowsMove transform={scale}/>}/>
			<TransformPopover store={store} tool={TransformEnum.Rotate} description={'rotate'} icon={<Md3DRotation transform={scale}/>}/>
			<TransformPopover store={store} tool={TransformEnum.Scale} description={'scale'} icon={<FiCode transform={scale}/>}/>
		</FlexBoxRowFit>
	</>;
});


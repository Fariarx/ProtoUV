import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { observer } from 'mobx-react';
import React from 'react';
import { FlexBoxRowFit } from 'renderer/Shared/Styled/FlexBox';
import { AppStore } from '../../../../AppStore';
import { TransformEnum } from '../../../../Shared/Libs/Types';
import { Sizes } from '../../../../Shared/Styled/Sizes';
import { StyledToolButton } from '../StyledToolButton';
import { TransformStore } from './TransformStore';

export const TransformApp = observer(() => {
	const  store: TransformStore = TransformStore.getInstance();

	const size = Sizes.twentyFour;
	const scale = 'scale(1.1)';

	return <>
		<FlexBoxRowFit sx={{
			userSelect: 'none',
			height: 'fit-content',
			width: 'fit-content',
		}}>
			<ToolButtonTransform size={size} store={store} tool={TransformEnum.Move} description={'move'}>
				<BsArrowsMove transform={scale}/>
			</ToolButtonTransform>
			<ToolButtonTransform size={size} store={store} tool={TransformEnum.Rotate} description={'rotate'}>
				<Md3DRotation transform={scale}/>
			</ToolButtonTransform>
			<ToolButtonTransform size={size} store={store} tool={TransformEnum.Scale} description={'scale'}>
				<FiCode transform={scale}/>
			</ToolButtonTransform>
		</FlexBoxRowFit>
	</>;
});

const ToolButtonTransform = observer((props: {
  children: React.ReactElement;
  store: TransformStore;
  tool: TransformEnum;
  size: string;
  description: string;
}) => {
	const selected = props.store.state === props.tool;
	const change = (state: TransformEnum) => AppStore.transform.state = state === AppStore.transform.state ?
		TransformEnum.None : state;

	return <StyledToolButton onClick={() => change(props.tool)} description={props.description} selected={selected}>
		{props.children}
	</StyledToolButton>;
});

import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { observer } from 'mobx-react';
import React from 'react';
import { FlexBoxColumnFit, FlexBoxRowFit, flexChildrenCenter } from 'renderer/Shared/Styled/FlexBox';
import { AppStore } from '../../AppStore';
import { APP_HEADER_HEIGHT } from '../../HeaderApp';
import { TransformEnum } from '../../Shared/Libs/Types';
import { Sizes } from '../../Shared/Styled/Sizes';
import { colors } from '../../Shared/Theme';
import { TransformStore } from './TransformStore';

export const TransformApp = observer(() => {
	const  store: TransformStore = TransformStore.getInstance();

	const width = Sizes.sum(Sizes.twentyFour, Sizes.twelve);

	return <>
		<FlexBoxRowFit sx={{
			position: 'absolute',
			top: Sizes.sum(Sizes.eight, APP_HEADER_HEIGHT),
			userSelect: 'none',
			height: 'fit-content',
			width: 'fit-content',
			padding: Sizes.four,
			paddingBottom: 0,
			paddingRight: 0,
			backgroundColor: colors.background.dark,
			borderRadius: Sizes.four,
			marginLeft: Sizes.eight
		}}>
			<ToolButton width={width} store={store} tool={TransformEnum.Move}>
				<BsArrowsMove transform={'scale(1.4)'} color={colors.background.light}/>
			</ToolButton>
			<ToolButton width={width} store={store} tool={TransformEnum.Rotate}>
				<Md3DRotation transform={'scale(1.4)'} color={colors.background.light}/>
			</ToolButton>
			<ToolButton width={width} store={store} tool={TransformEnum.Scale}>
				<FiCode transform={'scale(1.4)'} color={colors.background.light}/>
			</ToolButton>
		</FlexBoxRowFit>
	</>;
});

const ToolButton = observer((props: {
  children: React.ReactElement;
  store: TransformStore;
  tool: TransformEnum;
  width: string;
}) => {
	const selected = props.store.state === props.tool;
	const change = (state: TransformEnum) => {
		AppStore.transform.state = state === AppStore.transform.state ?
			TransformEnum.None : state;
		console.log(AppStore.transform, 2);
	};

	return <FlexBoxColumnFit onClick={()=>change(props.tool)} sx={{
		width: props.width,
		height: props.width,
		...flexChildrenCenter,
		marginBottom: Sizes.four,
		marginRight: Sizes.four,
		borderRadius: selected ? Sizes.eight : '45%',
		backgroundColor: selected ? colors.interact.neutral : colors.background.common,
		transition: 'all 0.3s',
		'&:hover': {
			borderRadius: Sizes.eight,
			backgroundColor: colors.interact.neutral
		},
		'&:active': {
			borderRadius: Sizes.four,
			backgroundColor: colors.interact.touch,
			//transform: 'translateY(-2px)'
		}
	}}>
		{props.children}
	</FlexBoxColumnFit>;
});

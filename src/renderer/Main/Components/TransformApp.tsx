import { Stack, Typography } from '@mui/material';
import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { observer } from 'mobx-react';
import { FlexBoxColumnFit, FlexBoxRow, flexChildrenCenter } from 'renderer/Shared/Styled/FlexBox';
import { AppStore } from '../../AppStore';
import { APP_HEADER_HEIGHT } from '../../HeaderApp';
import { colors } from '../../Shared/Colors';
import { TransformEnum } from '../../Shared/Libs/Types';
import { ButtonSetting } from '../../Shared/Styled/ButtonSetting';
import { Sizes } from '../../Shared/Styled/Sizes';
import { TransformStore } from './TransformStore';

export const TransformApp = observer(() => {
	const  store: TransformStore = TransformStore.getInstance();

	const change = (state: TransformEnum) => {
		AppStore.transform.state = state === AppStore.transform.state ?
			TransformEnum.None : state;
		console.log(AppStore.transform, 2);
	};

	const width = Sizes.sum(Sizes.twentyFour, Sizes.twelve);

	return <>
		<FlexBoxColumnFit sx={{
			position: 'absolute',
			top: '30%',
			userSelect: 'none',
			height: 'fit-content',
			width: Sizes.sum(width, Sizes.eight),
			padding: Sizes.four,
			paddingBottom: 0,
			backgroundColor: colors.background.dark,
			borderRadius: Sizes.eight,
			marginLeft: Sizes.eight,
		}}>
			<FlexBoxColumnFit sx={{
				width: width,
				height: width,
				borderRadius: Sizes.four,
				...flexChildrenCenter,
				backgroundColor: colors.background.common,
				marginBottom: Sizes.four
			}}>
				<BsArrowsMove transform={'scale(1.5)'} color={colors.background.light}/>
				<Typography variant="subtitle1">move</Typography>
			</FlexBoxColumnFit>
			<FlexBoxColumnFit sx={{
				width: width,
				height: width,
				borderRadius: Sizes.four,
				...flexChildrenCenter,
				backgroundColor: colors.background.common,
				marginBottom: Sizes.four
			}}>
				<Md3DRotation transform={'scale(1.5)'} color={colors.background.light}/>
			</FlexBoxColumnFit>
			<FlexBoxColumnFit sx={{
				width: width,
				height: width,
				borderRadius: Sizes.four,
				...flexChildrenCenter,
				backgroundColor: colors.background.common,
				marginBottom: Sizes.four
			}}>
				<FiCode transform={'scale(1.5)'} color={colors.background.light}/>
			</FlexBoxColumnFit>
		</FlexBoxColumnFit>
	</>;
});

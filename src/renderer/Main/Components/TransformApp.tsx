import { Stack } from '@mui/material';
import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { TransformEnum } from '../../Shared/Enum/TransformEnum';
import { ButtonSetting } from '../../Shared/Styled/ButtonSetting';
import { Sizes } from '../../Shared/Styled/Sizes';
import { TransformStore } from './TransformStore';

export const TransformApp = (props: { store: TransformStore }) => {
	const change = (state: TransformEnum) => {
		props.store.state = state === props.store.state ?
			TransformEnum.None : state;
	};

	return <>
		<Stack direction={'column'} spacing={Sizes.four} sx={{
			position: 'absolute',
			top: '25%',
			left: Sizes.twelve,
		}}>
			<ButtonSetting
				onClick={()=>change(TransformEnum.Move)}
				selected={props.store.state === TransformEnum.Move}>
				<BsArrowsMove transform={'scale(1.5)'}/>
			</ButtonSetting>
			<ButtonSetting
				onClick={()=>change(TransformEnum.Rotate)}
				selected={props.store.state === TransformEnum.Rotate}>
				<Md3DRotation transform={'scale(1.5)'}/>
			</ButtonSetting>
			<ButtonSetting
				onClick={()=>change(TransformEnum.Scale)}
				selected={props.store.state === TransformEnum.Scale}>
				<FiCode transform={'scale(1.5)'}/>
			</ButtonSetting>
		</Stack>
	</>;
};

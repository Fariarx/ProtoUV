import { Stack } from '@mui/material';
import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { observer } from 'mobx-react';
import { AppStore } from '../../AppStore';
import { TransformEnum } from '../../Shared/Enum/TransformEnum';
import { ButtonSetting } from '../../Shared/Styled/ButtonSetting';
import { Sizes } from '../../Shared/Styled/Sizes';
import { TransformStore } from './TransformStore';

export const TransformApp = observer((props: { store: TransformStore }) => {
	const change = (state: TransformEnum) => {
		AppStore.transform.state = state === AppStore.transform.state ?
			TransformEnum.None : state;
		console.log(AppStore.transform, 2);
	};

	console.log(props.store,1);
	return <>
		<Stack direction={'column'} spacing={Sizes.four} sx={{
			position: 'absolute',
			top: '25%',
			left: Sizes.twelve,
		}}>
			<ButtonSetting
				onClick={()=>change(TransformEnum.Move)}
				checked={props.store.state === TransformEnum.Move}>
				<BsArrowsMove transform={'scale(1.5)'}/>
			</ButtonSetting>
			<ButtonSetting
				onClick={()=>change(TransformEnum.Rotate)}
				checked={props.store.state === TransformEnum.Rotate}>
				<Md3DRotation transform={'scale(1.5)'}/>
			</ButtonSetting>
			<ButtonSetting
				onClick={()=>change(TransformEnum.Scale)}
				checked={props.store.state === TransformEnum.Scale}>
				<FiCode transform={'scale(1.5)'}/>
			</ButtonSetting>
		</Stack>
	</>;
});

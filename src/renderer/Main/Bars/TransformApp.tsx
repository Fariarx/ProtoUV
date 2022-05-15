import {
	Stack
} from '@mui/material';
import { BsArrowsMove } from '@react-icons/all-files/bs/BsArrowsMove';
import { FiCode } from '@react-icons/all-files/fi/FiCode';
import { Md3DRotation } from '@react-icons/all-files/md/Md3DRotation';
import { ButtonSetting } from '../../Shared/Styled/ButtonSetting';
import { Sizes } from '../../Shared/Styled/Sizes';

export const TransformApp = () => {
	return <>
		<Stack direction={'column'} spacing={Sizes.four} sx={{
			position: 'absolute',
			top: '25%',
			left: Sizes.twelve,
		}}>
			<ButtonSetting>
				<BsArrowsMove transform={'scale(1.5)'}/>
			</ButtonSetting>
			<ButtonSetting>
				<Md3DRotation transform={'scale(1.5)'}/>
			</ButtonSetting>
			<ButtonSetting>
				<FiCode transform={'scale(1.5)'}/>
			</ButtonSetting>
		</Stack>
	</>;
};

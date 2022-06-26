import { Box, Fade, Modal } from '@mui/material';
import { AiOutlineFileAdd } from '@react-icons/all-files/ai/AiOutlineFileAdd';
import { colors } from '../../Shared/Colors';

export const DragAndDropApp = ({ open } : { open:boolean }) => {
	return <Modal
		open={open}
		closeAfterTransition
		sx={{
			userSelect:'none'
		}}
	>
		<Fade in={open}>
			<Box sx={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)'
			}}>
				<AiOutlineFileAdd transform={'scale(3)'} style={{ color: colors.background.white }}/>
			</Box>
		</Fade>
	</Modal>;
};
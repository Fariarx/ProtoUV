import { observer } from 'mobx-react-lite';
import { AppStore, Pages } from '../AppStore';
import { BigButton } from '../Main/Components/Slice/SliceButtonApp';
import { colors } from '../Shared/Config';
import { FlexBoxColumn } from '../Shared/Styled/FlexBox';

export const SlicingApp = observer(() => {
	return <FlexBoxColumn>
		{AppStore.slice.image !== '' && <img
			src={AppStore.slice.isWorking
				? AppStore.slice.image
				: AppStore.slice.imageLargest}
			style={{
				width: '100%',
				height: '100%'
			}}
		/>}
		<BigButton sx={{
			opacity: 0.6,
			':hover':{
				backgroundColor: colors.interact.warning
			},
			':activate': {
				backgroundColor: colors.interact.warning
			},
			width: 'fit-content',
			mr: '2px'
		}} onClick={() => {
			AppStore.slice.reset();
			AppStore.changeState(Pages.Main);
		}}>
      Cancel
		</BigButton>
	</FlexBoxColumn>;
});


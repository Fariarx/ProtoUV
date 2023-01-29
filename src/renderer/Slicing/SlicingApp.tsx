import { observer } from 'mobx-react-lite';
import { AppStore, Pages } from '../AppStore';
import { BigButton } from '../Main/Components/Slice/SliceButtonApp';
import { colors } from '../Shared/Config';
import { FlexBoxColumn } from '../Shared/Styled/FlexBox';

export const SlicingApp = observer(() => {
	return <FlexBoxColumn>
		{AppStore.slice.image !== '' && <img
			src={AppStore.slice.image}
			style={{
				width: '100%',
				height: '100%'
			}}
		/>}
		<BigButton sx={{
			':hover':{
				backgroundColor: colors.background.commonest
			},
			':activate': {
				backgroundColor: colors.background.light
			}
		}} onClick={() => {
			AppStore.slice.reset();
			AppStore.changeState(Pages.Main);
		}}>
      Back to scene
		</BigButton>
	</FlexBoxColumn>;
});


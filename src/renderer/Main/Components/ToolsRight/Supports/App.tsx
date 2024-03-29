import { Box } from '@mui/material';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { MdAddCircleOutline } from '@react-icons/all-files/Md/MdAddCircleOutline';
import { MdRemoveCircleOutline } from '@react-icons/all-files/Md/MdRemoveCircleOutline';
import { MdWbAuto } from '@react-icons/all-files/md/MdWbAuto';
import { observer } from 'mobx-react-lite';
import { AppStore, Log, Pages } from 'renderer/AppStore';
import { colors } from 'renderer/Shared/Config';
import { Dispatch } from 'renderer/Shared/Events';
import { AppEventEditSupports, AppEventEnum, SupportsEnum } from 'renderer/Shared/Libs/Types';
import { Sizes } from 'renderer/Shared/Styled/Sizes';
import { SupportsGenerator } from './Shared/SupportsGen';
import { ToolButton } from './Shared/ToolButton';

export const App = observer(() => {

	return <Box sx={{
		width: '100%',
		height: 'fit-content',
		padding: '8px',
		border: '1px solid ' + colors.background.darkest,
		borderRight: 'unset',
		backgroundColor: colors.background.common,
		borderRadius: Sizes.four + ' 0' + ' 0 ' + Sizes.four,
		mt: 1,
	}}>
		<Box sx={{
			display: 'flex',
			gap: 0.5,
		}}>
			<ToolButton
				text={'add support tool\npress R to randomize'}
				isActive={AppStore.performSupports.state === SupportsEnum.Add}
				onClick={() => AppStore.performSupports.changeState(  SupportsEnum.Add)}>
				<MdAddCircleOutline transform='scale(1.1)' color={colors.background.light}/>
			</ToolButton>
			<ToolButton
				text='remove support tool'
				isActive={AppStore.performSupports.state === SupportsEnum.Remove}
				onClick={() => AppStore.performSupports.changeState( SupportsEnum.Remove)}>
				<MdRemoveCircleOutline transform='scale(1.1)' color={colors.background.light}/>
			</ToolButton>
			<ToolButton
				text='auto generate supports'
				isActive={false}
				onClick={() => {
					if (!AppStore.sceneStore.groupSelectedLast)
					{
						Log('select object not found');
					}
					else {
						if (!AppStore.sceneStore.groupSelectedLast.supports?.length)
						{
							AppStore.sceneStore.groupSelectedLast.supports = [];
							AppStore.sceneStore.groupSelectedLast.AlignToPlaneY(true);
						}

						const supports = SupportsGenerator(
            AppStore.sceneStore.printer!,
            AppStore.sceneStore.groupSelectedLast.mesh,
            AppStore.sceneStore.objects.map(obj => obj.mesh));

						if (!supports.length) {
							Log('generation result is empty');
						}
						else {
							Dispatch(AppEventEnum.EDIT_SUPPORTS, {
								object: AppStore.sceneStore.groupSelectedLast,
								supports: supports
							} as AppEventEditSupports);
						}
					}
				}}>
				<MdWbAuto transform='scale(1.1)' color={colors.background.light}/>
			</ToolButton>
			<ToolButton
				text='edit supports preset'
				isActive={false}
				onClick={() => {
					AppStore.sceneStore.isOpenSupportEditor = true;
				}}>
				<BiEditAlt transform='scale(1.1)' color={colors.background.light}/>
			</ToolButton>
		</Box>
	</Box>;
});

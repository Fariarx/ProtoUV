import { ToggleButton, Tooltip } from '@mui/material';
import { FiSave } from '@react-icons/all-files/fi/FiSave';
import { observer } from 'mobx-react-lite';
import { AppStore, Pages } from '../AppStore';
import { BigButton } from '../Main/Components/ToolsRight/Slice/SliceButtonApp';
import { colors, config, saveConfig } from '../Shared/Config';
import { FlexBoxColumn, FlexBoxRow } from '../Shared/Styled/FlexBox';

export const SlicingApp = observer(() => {
	const isSliced = AppStore.slice.sliceCount > AppStore.slice.sliceCountMax;

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
		<FlexBoxRow sx={{
			width:'fit-content',
			height:'fit-content',
			position: 'fixed',
			bottom: '30px',
			right: '4px',
			gap: '4px'
		}}>
			{!isSliced && <Tooltip title={'Autosave to last folder' + (config.pathToSave ? ': ' + config.pathToSave : '')} arrow placement={'top'}>
				<ToggleButton value="check" selected={config.saveAutomatically} onChange={() => {
					config.saveAutomatically = !config.saveAutomatically;
					saveConfig();
				}} sx={{
					height: '36px',
					width: '36px',
				}}>
					<FiSave />
				</ToggleButton>
			</Tooltip>}
			<BigButton sx={{
				opacity: 0.8,
				':hover':{
					backgroundColor: colors.background.commonest,
				},
				':activate': {
					backgroundColor: colors.background.commonest,
				},
				width: 'fit-content',
				mr: '2px', position: 'unset',
				border: '1px solid ' + colors.interact.danger,
			}} onClick={() => {
				AppStore.slice.reset();
				AppStore.changeState(Pages.Main);
			}}>
        Cancel
			</BigButton>
			{isSliced && <>
				<BigButton sx={{
					opacity: 0.8,
					':hover':{
						backgroundColor: colors.background.commonest,
					},
					':activate': {
						backgroundColor: colors.background.commonest,
					},
					width: 'fit-content',
					mr: '2px', position: 'unset',
					border: '1px solid ' + colors.interact.success,
				}} onClick={() => {
					AppStore.slice.finalize(false, true);
				}}>
          Select path to save
				</BigButton>
			</>}
		</FlexBoxRow>
	</FlexBoxColumn>;
});


import '@fontsource/roboto/300.css';
import {
	CssBaseline,
	ThemeProvider
} from '@mui/material';
import { observer } from 'mobx-react';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './AppStore';
import { AppStore, Log, Pages } from './AppStore';
import { ConfiguratorAutoApp } from './Configurator/AppAuto';
import { ConfiguratorManuallyApp } from './Configurator/AppManually';
import { DragAndDropApp } from './Main/Components/DragAndDrop/App';
import { FlyModeDescriptionApp } from './Main/Components/Shared/FlyModeDescriptionApp';
import { SliceButton } from './Main/Components/Slice/SliceButton';
import { SupportEditorApp } from './Main/Components/SupportEditor/App';
import { ToolsLeftApp } from './Main/Components/ToolsLeft/App';
import { ToolsRightApp } from './Main/Components/ToolsRight/App';
import { SupportsRemoveCircleApp } from './Main/Components/ToolsRight/Supports/Shared/SupportsRemoveCircleApp';
import { ViewChangeApp } from './Main/Components/ViewChange/App';
import { ConsoleApp } from './Main/Console/App';
import { SceneApp } from './Main/Scene/App';
import { LineBottomApp } from './Screen/Bottom/App';
import { HeaderApp } from './Screen/Header/App';
import { AppVersion, bridge } from './Shared/Globals';
import { AnimationFade, AnimationGrow } from './Shared/Styled/Animation';
import { FlexBoxColumn, FlexBoxRow } from './Shared/Styled/FlexBox';
import { Sizes } from './Shared/Styled/Sizes';
import { UpdateScheme, darkTheme } from './Shared/Theme';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { SlicingApp } from './Slicing/App';

UpdateScheme();

const Main = observer(() => {
	return <FlexBoxColumn sx={{
		opacity: AppStore.instance.ready ? '1' : '0'
	}}>
		<ThemeProvider theme={darkTheme}>
			<SupportsRemoveCircleApp/>
			<CssBaseline enableColorScheme />
			<HeaderApp />

			<AnimationFade in={AppStore.getState() === Pages.Main}>
				<FlexBoxRow>
					<SupportEditorApp/>
					<FlyModeDescriptionApp/>
					<FlexBoxRow>
						<SceneApp/>
						<ToolsRightApp/>
						<SliceButton/>
					</FlexBoxRow>
					<ToolsLeftApp/>
					<ViewChangeApp/>
					<ConsoleApp />
					<LineBottomApp/>
					<DragAndDropApp open={AppStore.instance.dropFile} />
				</FlexBoxRow>
			</AnimationFade>

			<AnimationGrow in={AppStore.getState() === Pages.Configurator}>
				<FlexBoxRow>
					<ConfiguratorAutoApp/>
					<ConsoleApp mb={Sizes.twelve}/>
				</FlexBoxRow>
			</AnimationGrow>

			<AnimationGrow in={AppStore.getState() === Pages.ConfiguratorManually}>
				<FlexBoxColumn>
					<ConfiguratorManuallyApp/>
				</FlexBoxColumn>
			</AnimationGrow>

			<AnimationGrow in={AppStore.getState() === Pages.Slice}>
				<FlexBoxColumn>
					<SlicingApp/>
					<ConsoleApp />
					<LineBottomApp/>
				</FlexBoxColumn>
			</AnimationGrow>

		</ThemeProvider>
	</FlexBoxColumn>;
});

export const App = () => <Router>
	<Routes>
		<Route path="/" element={<Main />} />
	</Routes>
</Router>;

Log('Application started');
Log('Version: ' + AppVersion);

bridge.ipcRenderer.receive('version-info', (svg: string) => {
	if (!svg.toLowerCase().includes(AppVersion.toLowerCase()))
	{
		Log('Update found');
		AppStore.instance.newVersion = svg;
	}
});

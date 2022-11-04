import '@fontsource/roboto/300.css';
import {
	CssBaseline,
	ThemeProvider
} from '@mui/material';
import { observer } from 'mobx-react';
import { SnackbarProvider } from 'notistack';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './AppStore';
import { AppStore, Log, Pages } from './AppStore';
import { LineBottomApp } from './BottomApp';
import { ConfiguratorAutoApp } from './Configurator/ConfiguratorAutoApp';
import { ConfiguratorManuallyApp } from './Configurator/ConfiguratorManuallyApp';
import { HeaderApp } from './HeaderApp';
import { DragAndDropApp } from './Main/Components/DranAndDrop/DragAndDropApp';
import { ToolsLeftApp } from './Main/Components/ToolsLeft/ToolsLeftApp';
import { ToolsTabApp } from './Main/Components/ToolsTab/ToolsTabApp';
import { ViewChangeApp } from './Main/Components/ViewChange/ViewChangeApp';
import { ConsoleApp } from './Main/Console/ConsoleApp';
import { SceneApp } from './Main/Scene/SceneApp';
import { AnimationFade, AnimationGrow } from './Shared/Styled/Animation';
import { FlexBoxColumn, FlexBoxRow } from './Shared/Styled/FlexBox';
import { Sizes } from './Shared/Styled/Sizes';
import { UpdateScheme, darkTheme } from './Shared/Theme';

UpdateScheme();

const Main = observer(() => {
	return <FlexBoxColumn sx={{ opacity: AppStore.instance.ready ? '1' : '0' }}>
		<SnackbarProvider maxSnack={3}>
			<ThemeProvider theme={darkTheme}>
				<CssBaseline enableColorScheme />
				<HeaderApp />

				<AnimationFade in={AppStore.getState() === Pages.Main}>
					<FlexBoxRow>
						<FlexBoxRow>
							<SceneApp/>
							<ToolsTabApp/>
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

			</ThemeProvider>
		</SnackbarProvider>
	</FlexBoxColumn>;
});

export const App = () => <Router>
	<Routes>
		<Route path="/" element={<Main />} />
	</Routes>
</Router>;

Log('Application started');


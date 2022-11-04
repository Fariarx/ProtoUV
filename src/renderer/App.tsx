import '@fontsource/roboto/300.css';
import {
	CssBaseline,
	Divider,
	ThemeProvider
} from '@mui/material';
import { observer } from 'mobx-react';
import { SnackbarProvider } from 'notistack';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './AppStore';
import { AppStore, Log, Pages } from './AppStore';
import { APP_BOTTOM_HEIGHT_PX, LineBottomApp } from './BottomApp';
import { ConfiguratorAutoApp } from './Configurator/ConfiguratorAutoApp';
import { ConfiguratorManuallyApp } from './Configurator/ConfiguratorManuallyApp';
import { HeaderApp } from './HeaderApp';
import { DragAndDropApp } from './Main/Components/DragAndDropApp';
import { ToolsApp } from './Main/Components/ToolsApp';
import { ViewChangeApp } from './Main/Components/ViewChange/ViewChangeApp';
import { ConsoleApp } from './Main/Console/ConsoleApp';
import { SceneApp } from './Main/Scene/SceneApp';
import { colors } from './Shared/Config';
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
							<SceneApp />
							<FlexBoxRow
								onMouseDown={() => {

								}}
								sx={{
									width: '400px',
									height: 'calc(100% - ' + APP_BOTTOM_HEIGHT_PX + ')',
									background: colors.background.dark,
									borderLeft: '1px solid ' + colors.background.darkest
								}}>
								<FlexBoxColumn sx={{
									width: '5px',
									transition: '0.5s ease-out',
									cursor: 'col-resize',
									':hover': {
										backgroundColor: colors.interact.touch,
										width: Sizes.eight
									}
								}}>

								</FlexBoxColumn>
							</FlexBoxRow>
						</FlexBoxRow>
						<ToolsApp/>
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


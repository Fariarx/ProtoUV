import '@fontsource/roboto/300.css';
import {
	Box, CssBaseline,
	Divider,
	ThemeProvider
} from '@mui/material';
import { observer } from 'mobx-react';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './AppStore';
import { AppStore, Log, Pages } from './AppStore';
import { BottomLineApp } from './BottomLineApp';
import { HeaderApp } from './HeaderApp';
import { DragAndDropApp } from './Main/Components/DragAndDropApp';
import { ConsoleApp } from './Main/Console/ConsoleApp';
import { AutoConfiguratorApp } from './Main/Printer/Configurator/AutoConfiguratorApp';
import { ManuallyConfiguratorApp } from './Main/Printer/Configurator/ManuallyConfiguratorApp';
import { SceneApp } from './Main/Scene/SceneApp';
import { UpdateScheme, darkTheme } from './Shared/Colors';
import { FadeUnmount } from './Shared/Styled/FadeUnmount';
import { FlexBoxColumn, FlexBoxRow } from './Shared/Styled/FlexBox';

UpdateScheme();

const Main = observer(() => {
	const store = AppStore.getInstance();

	return <ThemeProvider theme={darkTheme}>
		<CssBaseline enableColorScheme />
		<FadeUnmount in={store.state === Pages.Main}>
			<FlexBoxRow>
				<FlexBoxColumn>
					<HeaderApp />
					<Divider />
					<FlexBoxRow>
						<Box sx={{
							width:'100%',
							height: '100%'
						}}>
							<SceneApp />
						</Box>
					</FlexBoxRow>
					<BottomLineApp/>
				</FlexBoxColumn>
				<ConsoleApp />
				<DragAndDropApp open={false} />
			</FlexBoxRow>
		</FadeUnmount>
		<FadeUnmount in={store.state === Pages.Configurator}>
			<FlexBoxColumn>
				<AutoConfiguratorApp/>
			</FlexBoxColumn>
		</FadeUnmount>
		<FadeUnmount in={store.state === Pages.ConfiguratorManually}>
			<FlexBoxColumn>
				<ManuallyConfiguratorApp/>
			</FlexBoxColumn>
		</FadeUnmount>
	</ThemeProvider>;
});

export const App = () => <Router>
	<Routes>
		<Route path="/" element={<Main />} />
	</Routes>
</Router>;

Log('Application started');


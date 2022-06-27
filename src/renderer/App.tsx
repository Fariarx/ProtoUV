import './AppStore';
import '@fontsource/roboto/300.css';
import { Box, Divider, ThemeProvider } from '@mui/material';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { Log } from './AppStore';
import { BottomLineApp } from './BottomLineApp';
import { HeaderApp } from './HeaderApp';
import { DragAndDropApp } from './Main/Components/DragAndDropApp';
import { ConsoleApp } from './Main/Console/ConsoleApp';
import { SceneApp } from './Main/Scene/SceneApp';
import { UpdateScheme, darkTheme } from './Shared/Colors';
import { FlexBoxColumn, FlexBoxRow } from './Shared/Styled/FlexBox';

UpdateScheme();

const Main = () => {

	return <>
		<ThemeProvider theme={darkTheme}>
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
				<Divider />
				<BottomLineApp/>
			</FlexBoxColumn>
		</ThemeProvider>
		<ConsoleApp />
		<DragAndDropApp open={false} />
	</>;
};

export const App = () => <Router>
	<Routes>
		<Route path="/" element={<Main />} />
	</Routes>
</Router>;

Log('Application started');


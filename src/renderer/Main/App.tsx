import './AppStore';
import '@fontsource/roboto/300.css';
import { Box, Divider, Stack, ThemeProvider } from '@mui/material';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { UpdateScheme, darkTheme } from '../Shared/Colors';
import { FlexBoxRow } from '../Shared/Styled/FlexBox';
import { Sizes } from '../Shared/Styled/Sizes';
import { AppStore, Log } from './AppStore';
import { CameraTypeApp } from './Components/CameraTypeApp';
import { DragAndDropApp } from './Components/DragAndDropApp';
import { MenuApp } from './Components/MenuApp';
import { SelectedApp } from './Components/SelectedApp';
import { TransformApp } from './Components/TransformApp';
import { ConsoleApp } from './Console/ConsoleApp';
import { APP_HEADER_HEIGHT, HeaderApp } from './HeaderApp';
import { SceneApp } from './Scene/SceneApp';

UpdateScheme();

const Main = () => {

	return <ThemeProvider theme={darkTheme}>
		<HeaderApp />
		<Divider />
		<FlexBoxRow>
			<Box sx={{
				height:'100%',
				flexGrow: 1
			}}>
				<SceneApp/>
			</Box>
		</FlexBoxRow>
		<ConsoleApp marginLeft={Sizes.twelve}/>
		<DragAndDropApp open={false}/>
	</ThemeProvider>;
};

export const App = () => <Router>
	<Routes>
		<Route path="/" element={<Main />} />
	</Routes>
</Router>;

Log('Application started');


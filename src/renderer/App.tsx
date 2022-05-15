import './AppStore';
import '@fontsource/roboto/300.css';
import { Box, Stack, ThemeProvider } from '@mui/material';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { Log } from './AppStore';
import { APP_HEADER_HEIGHT, Header } from './Header';
import { CameraTypeApp } from './Main/Bars/CameraTypeApp';
import { MenuApp } from './Main/Bars/MenuApp';
import { SelectedApp } from './Main/Bars/SelectedApp';
import { TransformApp } from './Main/Bars/TransformApp';
import { ConsoleApp } from './Main/Console/ConsoleApp';
import { UpdateScheme, colors, darkTheme } from './Shared/Colors';
import { Sizes } from './Shared/Styled/Sizes';

UpdateScheme();

const Main = () => <ThemeProvider theme={darkTheme}>
	<Header />
	<Box sx={{
		width:'100%',
		height:'100%',
		backgroundColor: colors.background.heavy,
	}}>
	</Box>
	<ConsoleApp/>
	<TransformApp/>
	<Stack direction={'row'} spacing={Sizes.four} sx={{
		position: 'absolute',
		top: Sizes.sum(APP_HEADER_HEIGHT, Sizes.eight),
		left: Sizes.twelve,
	}}>
		<MenuApp />
		<CameraTypeApp />
	</Stack>
	<Stack direction={'row'} spacing={Sizes.four} sx={{
		position: 'absolute',
		top: Sizes.sum(APP_HEADER_HEIGHT, Sizes.eight),
		right: Sizes.twelve,
	}}>
		<SelectedApp/>
	</Stack>
</ThemeProvider>;

export const App = () => <Router>
	<Routes>
		<Route path="/" element={<Main />} />
	</Routes>
</Router>;

Log.Add('Application started');


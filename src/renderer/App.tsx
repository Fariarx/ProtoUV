import '@fontsource/roboto/300.css';
import { Box } from '@mui/material';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { Header } from './Header';
import { UpdateScheme, colors } from './Shared/Colors';

UpdateScheme();

const Main = () => <>
	<Header />
	<Box sx={{
		width:'100%',
		height:'100%',
		backgroundColor: colors.background.heavy,
	}}>

	</Box>
</>;

export const App = () => <Router>
	<Routes>
		<Route path="/" element={<Main />} />
	</Routes>
</Router>;

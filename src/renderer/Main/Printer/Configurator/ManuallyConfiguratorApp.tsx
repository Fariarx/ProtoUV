import { Box, Button, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { FiSave } from '@react-icons/all-files/fi/FiSave';
import { RiDeleteBackLine } from '@react-icons/all-files/ri/RiDeleteBackLine';
import { observer } from 'mobx-react';
import { AppStore, Pages } from '../../../AppStore';
import { HeaderApp } from '../../../HeaderApp';
import { colors } from '../../../Shared/Colors';
import { FlexBoxColumn, FlexBoxColumnFit, flexChildrenCenter } from '../../../Shared/Styled/FlexBox';
import { Sizes } from '../../../Shared/Styled/Sizes';
import { Printer } from '../Configs/Printer';

export const ManuallyConfiguratorApp = observer(() => {
	const example = Printer.LoadDefaultConfigFromFile();
	if (!example) {
		AppStore.instance.state = Pages.Configurator;
		return <Box/>;
	}

	return <FlexBoxColumn>
		<HeaderApp />
		<FlexBoxColumn sx={{
			width: 'unset',
			height: 'unset',
			flexGrow: 1,
			...flexChildrenCenter,
			padding: Sizes.multiply(Sizes.twentyFour, 3),
			pt: 0,
			pb: 0
		}}>
			<FlexBoxColumnFit sx={{
				maxHeight: '96%',
				overflow: 'auto',
				marginBottom: Sizes.twentyFour
			}}>
				<GridFields obj={example.Resolution} name={'Resolution'}/>
				<Divider sx={{ mt: Sizes.twelve, mb: Sizes.twelve, transform: 'translateY(12px)' }}/>
				<GridFields obj={example.Workspace} name={'Workspace'}/>
				<Divider sx={{ mt: Sizes.twelve, mb: Sizes.twelve, transform: 'translateY(12px)' }}/>
				<GridFields obj={example.PrintSettings} name={'Print Settings'}/>
				<Stack direction="row" spacing={1}>
					<Button variant="outlined" startIcon={<RiDeleteBackLine />}>
            Back
					</Button>
					<Button variant="contained" endIcon={<FiSave />}>
            Send
					</Button>
				</Stack>
			</FlexBoxColumnFit>
		</FlexBoxColumn>
	</FlexBoxColumn>;
});

const GridFields = (props: {obj: any, name: string}) => <FlexBoxColumnFit sx={{
	width: '100%',
	maxWidth: '1000px',
	height: 'unset'
}}>
	<Typography variant={'h6'} sx={{
		color: colors.background.white,
		margin: Sizes.eight,
		marginTop: Sizes.twelve
	}}>
		{props.name}
	</Typography>
	<Grid container spacing={2} sx={{ width: '100%', height: 'unset' }} >
		{Object.entries(props.obj)
			.map(x => <Grid key={x[0]} item xs={3}>
				<TextField variant="filled"
					label={x[0]}
					sx={{ width: '100%' }}
					type="number"
					defaultValue={x[1]}
					InputLabelProps={{
						shrink: true,
					}}
				/>
			</Grid>)}
	</Grid>
</FlexBoxColumnFit>;

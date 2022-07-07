import { List, ListItem, Paper, Typography } from '@mui/material';
import { SwitchAndroid } from 'renderer/Shared/Styled/SwitchAndroid';
import { Sizes } from '../../Shared/Styled/Sizes';
import { colors } from '../../Shared/Theme';

export const SelectedApp = () => {
	return <Paper variant={'outlined'} sx={{
		width:'250px',
		height:'fit-content',
		backgroundColor: colors.background.common,
	}}>
		<List
			sx={{ width: '100%', padding:0 }}>
			<ListItem sx={{
				padding: 0,
				paddingRight:Sizes.eight,
				paddingLeft:Sizes.eight,
				'&:hover': {
					bgcolor: colors.interact.touch
				},
				userSelect:'none'
			}}>
				<Typography sx={{
					whiteSpace:'nowrap',
					overflow:'hidden'
				}}>
          iogreioombtpvrlqorjvvrqmvqqv0-0qrmv0e.stl
				</Typography>
				<SwitchAndroid
					edge="end"
					inputProps={{
						'aria-labelledby': 'switch-list-label-wifi',
					}}
				/>
			</ListItem>
		</List>
	</Paper>;
};


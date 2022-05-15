import { List, ListItem, Paper, Typography } from '@mui/material';
import { Android12Switch } from 'renderer/Shared/Styled/Android12Switch';
import { colors } from '../../Shared/Colors';
import { Sizes } from '../../Shared/Styled/Sizes';

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
					bgcolor: colors.interact.selected
				},
				userSelect:'none'
			}}>
				<Typography sx={{
					whiteSpace:'nowrap',
					overflow:'hidden'
				}}>
          iogreioombtpvrlqorjvvrqmvqqv0-0qrmv0e.stl
				</Typography>
				<Android12Switch
					edge="end"
					inputProps={{
						'aria-labelledby': 'switch-list-label-wifi',
					}}
				/>
			</ListItem>
		</List>
	</Paper>;
};


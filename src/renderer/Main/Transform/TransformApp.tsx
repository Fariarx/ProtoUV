import { Backdrop, Box, IconButton, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import React from 'react';

const actions = [
	{ icon: <IconButton />, name: 'Copy' },
	{ icon: <IconButton />, name: 'Save' },
	{ icon: <IconButton />, name: 'Print' },
	{ icon: <IconButton />, name: 'Share' },
];

export const TransformApp = () => {
	const [open, setOpen] = React.useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	return (
		<Box sx={{ height: 330, transform: 'translateZ(0px)', flexGrow: 1 }}>
			<Backdrop open={open} />
			<SpeedDial
				ariaLabel="SpeedDial tooltip example"
				sx={{ position: 'absolute', bottom: 16, right: 16 }}
				icon={<SpeedDialIcon />}
				onClose={handleClose}
				onOpen={handleOpen}
				open={open}
			>
				{actions.map((action) => (
					<SpeedDialAction
						key={action.name}
						icon={action.icon}
						tooltipTitle={action.name}
						tooltipOpen
						onClick={handleClose}
					/>
				))}
			</SpeedDial>
		</Box>
	);
};

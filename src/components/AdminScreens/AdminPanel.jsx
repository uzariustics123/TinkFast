import { Box, colors, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import React, { useContext, useState } from 'react'
import { AdminSideBar } from './AdminSideBar'
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import './styles/adminPanel.css';
import { AppContext } from '../../AppContext';
import { Users } from './Users';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase';

export const AdminPanel = () => {
    const { drawerActiveItem, setDrawerActiveItem } = useContext(AppContext);
    const drawerWidth = 240;
    const [open, setOpen] = useState(false);
    const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
        ({ theme }) => ({
            flexGrow: 1,
            padding: theme.spacing(3),
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: `-${drawerWidth}px`,
            variants: [
                {
                    props: ({ open }) => open,
                    style: {
                        transition: theme.transitions.create('margin', {
                            easing: theme.transitions.easing.easeOut,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        marginLeft: 0,
                    },
                },
            ],
        }),
    );
    const AppBar = styled(MuiAppBar, {
        shouldForwardProp: (prop) => prop !== 'open',
    })(({ theme }) => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    width: `calc(100% - ${drawerWidth}px)`,
                    marginLeft: `${drawerWidth}px`,
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.easeOut,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                },
            },
        ],
    }));
    const DrawerHeader = styled('div')(({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start',
    }));
    const handleLogout = () => {
        if (confirm('Are you sure you want to log?')) {
            signOut(auth).then(() => {
                // Sign-out successful.
                console.log("User signed out successfully");
            }).catch((error) => {
                // An error happened during sign out
                console.error("Error signing out: ", error);
            });
        }
    };
    return (
        <>
            {/* <div>AdminPanel</div>
            <div className="appbar" style={{ zIndex: '1' }}>
                appbar
            </div> */}
            <Box sx={{ display: 'flex' }}>
                <CssBaseline></CssBaseline>
                <AppBar position="fixed" open={open}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => setOpen(!open)}
                            edge="start"
                            sx={[
                                {
                                    mr: 2,
                                },
                            ]}
                        >
                            <span className="material-symbols-outlined">{open ? 'close' : 'sort'}</span>
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            {open ? '' : 'TinkFast'}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                    variant="persistent"
                    anchor="left"
                    open={open}
                >
                    <DrawerHeader>
                        <Typography sx={{ float: 'left', color: colors.green[700], fontWeight: 'bold' }} variant="h6" noWrap component="div">
                            TinkFast
                        </Typography>
                    </DrawerHeader>
                    <Divider />
                    <List>
                        {[
                            'All Users',
                            'Teachers',
                            'Students',
                            'Dashboard',
                        ].map((keyText, index) => {
                            const isSelected = keyText == drawerActiveItem;
                            const onSelect = (key) => {
                                setDrawerActiveItem(key);
                            }
                            return (
                                <ListItem key={keyText} disablePadding>
                                    <ListItemButton selected={keyText == drawerActiveItem} onClick={() => { onSelect(keyText) }}>
                                        <ListItemIcon>
                                            {index == 0 && <span style={{ color: isSelected ? colors.green[500] : colors.grey[500] }} className='material-symbols-rounded'>groups</span>}
                                            {index == 1 && <span style={{ color: isSelected ? colors.green[500] : colors.grey[500] }} className='material-symbols-rounded'>people</span>}
                                            {index == 2 && <span style={{ color: isSelected ? colors.green[500] : colors.grey[500] }} className='material-symbols-rounded'>group</span>}
                                            {index == 3 && <span style={{ color: isSelected ? colors.green[500] : colors.grey[500] }} className='material-symbols-rounded'>dashboard</span>}
                                        </ListItemIcon>
                                        <ListItemText primary={keyText} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                    <Divider />
                    <List>
                        {['Logout'].map((text, index) => {
                            const logoutFx = () => {

                            }
                            return (
                                <ListItem key={text} disablePadding>
                                    <ListItemButton onClick={handleLogout}>
                                        <ListItemIcon >
                                            {index == 0 && <span className='material-symbols-rounded'>power</span>}
                                        </ListItemIcon>
                                        <ListItemText primary={text} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                </Drawer>
                <Main open={open}>
                    <DrawerHeader />
                    {/* <Typography sx={{ marginBottom: 2 }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
                        enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
                        imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
                        Convallis convallis tellus id interdum velit laoreet id donec ultrices.
                        Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
                        adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
                        nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
                        leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
                        feugiat vivamus at augue. At augue eget arcu dictum varius duis at
                        consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
                        sapien faucibus et molestie ac.
                    </Typography>
                    <Typography sx={{ marginBottom: 2 }}>
                        Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
                        eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
                        neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
                        tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
                        sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
                        tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
                        gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
                        et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
                        tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
                        eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
                        posuere sollicitudin aliquam ultrices sagittis orci a.
                    </Typography> */}
                    {drawerActiveItem == 'All Users' && <Users></Users>}
                </Main>
            </Box>
        </>
    )
}

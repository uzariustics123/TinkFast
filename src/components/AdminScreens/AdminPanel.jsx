import { Box, colors, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import React, { useContext, useState } from 'react'
import { AdminSideBar } from './AdminSideBar'
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import './styles/adminPanel.css';
import { AdminContext, AppContext } from '../../AppContext';
import { Users } from './Users';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase';
import { Classes } from './Classes';
import { Activities } from './Activities';

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
            <AdminContext.Provider value={{}}>

                {/* <div>AdminPanel</div>
            <div className="appbar" style={{ zIndex: '1' }}>
            appbar
            </div> */}
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline></CssBaseline>
                    <AppBar position="fixed">
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
                        // variant="persistent"
                        anchor="left"
                        open={open}
                    >
                        <DrawerHeader sx={{
                            justifyContent: 'space-around',
                            width: '100%'
                        }}>
                            <Typography sx={{ justifySelf: 'right', color: colors.green[700], fontWeight: 'bold' }} variant="h6" noWrap component="div">
                                TinkFast
                            </Typography>
                            <IconButton
                                aria-label="open drawer"
                                onClick={() => setOpen(!open)}
                                edge="end"
                            >
                                <span style={{ color: colors.green[900], fontWeight: 'bold', fontSize: '24px' }} className="material-symbols-outlined">{open ? 'close' : 'sort'}</span>
                            </IconButton>
                        </DrawerHeader>
                        <Divider />
                        <List>
                            {[
                                'All Users',
                                'Classes',
                                'Activities',
                            ].map((keyText, index) => {
                                const isSelected = keyText == drawerActiveItem;
                                const onSelect = (key) => {
                                    setDrawerActiveItem(key);
                                }
                                return (
                                    <ListItem key={keyText} disablePadding>
                                        <ListItemButton selected={keyText == drawerActiveItem} onClick={() => { onSelect(keyText); setOpen(false); }}>
                                            <ListItemIcon>
                                                {index == 0 && <span style={{ color: isSelected ? colors.green[500] : colors.grey[500] }} className='material-symbols-rounded'>groups</span>}
                                                {index == 1 && <span style={{ color: isSelected ? colors.green[500] : colors.grey[500] }} className='material-symbols-rounded'>school</span>}
                                                {index == 2 && <span style={{ color: isSelected ? colors.green[500] : colors.grey[500] }} className='material-symbols-rounded'>dashboard</span>}
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
                    <div style={{ width: '100%' }}>
                        <DrawerHeader />
                        <div style={{ width: '100%', padding: '1rem' }}>

                            {drawerActiveItem == 'All Users' && <Users />}
                            {drawerActiveItem == 'Classes' && <Classes />}
                            {drawerActiveItem == 'Activities' && <Activities />}
                        </div>
                    </div>
                </Box >
            </AdminContext.Provider>
        </>
    )
}

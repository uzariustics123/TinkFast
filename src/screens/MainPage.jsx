// import { Card, CardContent, Subtitle2, H5, Body2, Body1, CardAction, CardHeader, Button } from 'ui-neumorphism'
// import WaveView from '../components/WaveView';
// import TopBar from '../components/TopBar';
// import 'ui-neumorphism/dist/index.css';
// import '../index2.css';
import './styles/mainpage.css';
import SideBar from '../components/SideBar';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../components/Firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect, useState } from 'react';
import HomePage from './HomePage';
import ClassView from '../components/ClassView';
import { ClassContext } from '../AppContext';
import { AppContext } from '../AppContext';
import { collection, addDoc, query, where, getDoc, getDocs } from "firebase/firestore";
import { Snackbar, CircularProgress, Backdrop, ThemeProvider, createTheme, colors } from '@mui/material';
import { blue, green, lightGreen, lime, yellow } from '@mui/material/colors';
import { Users } from '../components/AdminScreens/Users';
import { AdminPanel } from '../components/AdminScreens/AdminPanel';
import { Dashboard } from '@mui/icons-material';
import { DashboardPanel } from '../components/DashboardPanel';
// import '../material-icons.css';

function MainPage() {
    let currentUser = null;
    let uid = null;
    const [userData, setUserData] = useState({});
    const [classDocData, setClassDocData] = useState(null);
    const [openedClass, setOpenedClass] = useState(null);
    const { currentUserData, setSettingsDialog, setCurrentUserData, backdropOpen, setBackdropOpen, openSnackbar, setSnackbarOpen, snackbarMsg, setSnackbarMsg, setProfileDialog } = useContext(AppContext);
    const navigate = useNavigate();
    // if (auth.currentUser == null) {
    //     window.location = '/login';
    //     console.log(auth.currentUser);
    // }
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            uid = user.uid;
            // console.log('signed in');

        } else {
            // console.log('not signed in');
            window.location = '/login';
        }
    });
    const [currentPage, setCurrentPage] = useState('home');
    // useEffect(() => {
    //     setTimeout(() => {
    //         if (auth.currentUser == null) {
    //             window.location = '/login';
    //             console.log(auth.currentUser);
    //         }
    //     }, 1000);

    // }, []);
    const openClassCallback = (classData) => {
        // console.log('classdata', classData);
        setClassDocData(classData);
        setCurrentPage('class');

    }
    const handleCurrentDrawerMenuItem = (currentItem) => {
        if (!(currentItem == 'logout' || currentItem == 'profile' || currentItem == 'settings'))
            setCurrentPage(currentItem);
        if (currentItem == 'profile') {
            setProfileDialog(true);
        }
        else if (currentItem == 'settings') {
            setSettingsDialog(true);
        }

    }
    useEffect(() => {
        // console.log('openedClass', openedClass);
        setBackdropOpen(true);
        if (auth.currentUser !== null)
            getUserData();
    }, [auth.currentUser]);
    const getUserData = async () => {
        if (auth.currentUser.email == 'admin@tinkfast.net') {
            setCurrentUserData({ ...auth.currentUser });
            setBackdropOpen(false);
            console.log('the user', auth.currentUser);
            return;
        }

        const currentUser = auth.currentUser;
        const filteredQuery = query(collection(db, 'users'), where('uid', '==', currentUser.uid));
        try {
            const querySnapshot = await getDocs(filteredQuery);
            const user = querySnapshot.docs.map((doc) => doc.data());
            setCurrentUserData({ currentUser, ...user[0] });
            setUserData({ currentUser, ...user[0] });
            setBackdropOpen(false);
            // console.log('user ', user);

        } catch (error) {
            console.log('error getting user info', error);
        }
    };
    const handleSnackbarClose = () => {
        setSnackbarMsg('');
        setSnackbarOpen(false);

    }
    const customTheme = createTheme({
        palette: {
            primary: {
                light: '#6fbf73',
                main: colors.green[900],
                dark: '#357a38',
                contrastText: '#fff',
            },
            secondary: { main: colors.green[900] },
        },
        components: {
            // Name of the component
            MuiPaper: {
                styleOverrides: {
                    // Name of the slot
                    root: {
                        // Some CSS
                        borderRadius: '25px',
                    },
                },
            },
            MuiStepIcon: {
                styleOverrides: {
                    // Name of the slot
                    root: {
                        // Some CSS
                        color: blue,
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    // Name of the slot
                    root: {
                        // Some CSS
                        borderRadius: '25px',
                    },
                },
            }
        },
    });
    const adminTheme = createTheme({
        palette: {
            primary: {
                light: '#6fbf73',
                main: colors.green[900],
                dark: '#357a38',
                contrastText: '#fff',
            },
            secondary: { main: colors.green[900] },
        },
        components: {
            // Name of the component
            MuiPaper: {
                styleOverrides: {
                    // Name of the slot
                    root: {
                        // Some CSS
                        borderRadius: '0',
                    },
                },
            },
            MuiStepIcon: {
                styleOverrides: {
                    // Name of the slot
                    root: {
                        // Some CSS
                        color: blue,
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    // Name of the slot
                    root: {
                        // Some CSS
                        borderRadius: '25px',
                    },
                },
            }
        },
    });

    return (
        <>
            <ThemeProvider theme={customTheme}>

                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={backdropOpen}
                    onClick={() => { }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                {
                    (currentUserData.email == 'admin@tinkfast.net') ?
                        <ThemeProvider theme={adminTheme}><AdminPanel /></ThemeProvider> :
                        (currentUserData.email != null && currentUserData.email != 'admin@tinkfast.net') ? <ClassContext.Provider value={{ openedClass, setOpenedClass }}>
                            <SideBar onMenuItemClick={handleCurrentDrawerMenuItem} activeItem={currentPage} />
                            <div className="main-container">
                                {currentPage === 'home' && <HomePage selectedClassCallback={openClassCallback} />}
                                {currentPage === 'class' && <ClassView />}
                                {currentPage === 'dashboard' && <DashboardPanel />}
                                {/* {currentPage === 'home' ? <HomePage /> : <React.Fragment />} */}
                            </div>
                        </ClassContext.Provider> : <></>

                }
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    message={snackbarMsg}
                />
            </ThemeProvider>
        </>


    );
}
export default MainPage;
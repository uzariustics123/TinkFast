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
// import '../material-icons.css';

function MainPage() {
    let currentUser = null;
    let uid = null;
    const [classDocData, setClassDocData] = useState(null);
    const [openedClass, setOpenedClass] = useState(null);
    const { currentUserData, setCurrentUserData, backdropOpen, setBackdropOpen, openSnackbar, setSnackbarOpen, snackbarMsg, setSnackbarMsg } = useContext(AppContext);
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
        // else
        // console.log('item is ', currentItem);
        // console.log('current user', currentUserData);

    }
    useEffect(() => {
        // console.log('openedClass', openedClass);

        if (auth.currentUser !== null)
            getUserData();
    }, [auth.currentUser]);
    const getUserData = async () => {
        const currentUser = auth.currentUser;
        const filteredQuery = query(collection(db, 'users'), where('uid', '==', currentUser.uid));
        try {
            const querySnapshot = await getDocs(filteredQuery);
            querySnapshot.forEach((doc) => {
                setCurrentUserData({ currentUser, ...doc.data() });
                // console.log();

            });

        } catch (error) {
            // console.log('error getting user info', error);
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
                main: '#4caf50',
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

    return (
        <>
            <ThemeProvider theme={customTheme}>

                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={backdropOpen}
                    onClick={() => { }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <ClassContext.Provider value={{ openedClass, setOpenedClass }}>
                    <SideBar onMenuItemClick={handleCurrentDrawerMenuItem} activeItem={currentPage} />
                    <div className="main-container">
                        {currentPage === 'home' && <HomePage selectedClassCallback={openClassCallback} />}
                        {currentPage === 'class' && <ClassView />}
                        {/* {currentPage === 'home' ? <HomePage /> : <React.Fragment />} */}
                    </div>
                </ClassContext.Provider>
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
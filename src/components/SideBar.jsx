import React, { useEffect, useState, useLayoutEffect, useContext } from 'react'
import './styles/sideDrawer.css';
import '@material/web/all';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import '@material/web/typography/md-typescale-styles.css';
// import 'ui-neumorphism/dist/index.css';
import { Divider } from 'ui-neumorphism';
import { auth, db } from './Firebase';
import { collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { AppContext } from '../AppContext';
// import routes from '../routes/index.js'
// import { Card, withClickOutside, detectElementInDOM } from 'ui-neumorphism'



function Sidebar({ onMenuItemClick, activeItem }) {
    const { setDrawerActiveItem } = useContext(AppContext);
    const [currentItem, setItem] = useState('home');
    const [windowSize, setWindowSize] = useState([0, 0]);
    const [userData, setUserData] = useState(null);
    const [firstname, setFirstname] = useState('loading');
    const [imgUrl, setImgUrl] = useState('');
    const [lastname, setLastname] = useState('user...');
    const [userEmail, setEmail] = useState('');
    const userDBRef = collection(db, "users");
    useLayoutEffect(() => {
        function updateSize() {
            setWindowSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    const handleItemClick = (keyItem) => {
        onMenuItemClick(keyItem);
        if (!(keyItem == 'logout' || keyItem == 'profile' || keyItem == 'settings'))
            setItem(keyItem);
    }
    // first load events
    useEffect(() => {
        if (auth.currentUser !== null)
            getUserData();
    }, [auth.currentUser]);
    useEffect(() => {
        if (userData !== null) {
            setImgUrl(userData.imgUrl);
            setFirstname(userData.firstname);
            setLastname(userData.lastname);
            setEmail(userData.email);
        }
    }, [userData]);
    const getUserData = async () => {
        const currentUser = auth.currentUser;
        const filteredQuery = query(userDBRef, where('uid', '==', currentUser.uid));
        try {
            const querySnapshot = await getDocs(filteredQuery);

            querySnapshot.forEach((doc) => {
                setUserData(doc.data());
                // console.log('user data is', doc.data());
            });

        } catch (error) {
            console.log(error);

        }
    }
    const handleLogout = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log("User signed out successfully");
        }).catch((error) => {
            // An error happened during sign out
            console.error("Error signing out: ", error);
        });
    };
    return (
        <>
            <div className={windowSize[0] < 600 ? 'SideDrawer mobile' : 'SideDrawer'}>
                <div className="drawer-toggler"></div>
                {/* <h1 className='brand-name'>{windowSize[0] < 600 ? 'TF' : 'TinkFast'}</h1> */}
                <div className="user-profile">
                    <img src={imgUrl} alt="" className="user-img" />
                    <div className="user-info">
                        <p className="user-name">{firstname + ' ' + lastname}</p>
                        <p className="user-email">{userEmail}</p>
                    </div>
                </div>
                <p className='menu-sub'>Pages</p>
                <ul className="drawer-menu">
                    <li onClick={() => handleItemClick('home')} className={'home' == currentItem ? 'drawer-item active' : 'drawer-item'}>
                        <md-ripple></md-ripple>
                        <span className="material-symbols-rounded"> home</span>
                        <span className="drawer-item-title"> Home</span>
                    </li>
                    <li onClick={() => handleItemClick('dashboard')} className={'dashboard' == currentItem ? 'drawer-item active' : 'drawer-item'}>
                        <md-ripple></md-ripple>
                        <span className="material-symbols-rounded">bar_chart_4_bars</span>
                        <span className="drawer-item-title">Dashboard</span>
                    </li>
                    {/* <li onClick={() => handleItemClick('todo')} className={'todo' == currentItem ? 'drawer-item active' : 'drawer-item'}>
                        <md-ripple></md-ripple>
                        <span className="material-symbols-rounded"> checklist </span>
                        <span className="drawer-item-title">Todo's</span>
                    </li> */}
                    {/* <li onClick={() => handleItemClick('quizes')} className={'quizes' == currentItem ? 'drawer-item active' : 'drawer-item'}>
                        <md-ripple></md-ripple>
                        <span className="material-symbols-rounded">history_edu</span>
                        <span className="drawer-item-title">Quizes</span>
                    </li> */}
                </ul>
                <p className='menu-sub'>Accessibilities</p>
                <ul className="drawer-menu">
                    <li onClick={() => handleItemClick('profile')} className='drawer-item'>
                        <md-ripple></md-ripple>
                        <span className="material-symbols-outlined"> person</span><span className="drawer-item-title"> Profile</span>
                    </li>
                    <li onClick={() => handleItemClick('settings')} className='drawer-item'>
                        <md-ripple></md-ripple>
                        <span className="material-symbols-outlined"> settings</span><span className="drawer-item-title"> Settings</span>
                    </li>
                    <li onClick={() => document.getElementById('logout-dialog').show()} className='drawer-item'>
                        <md-ripple></md-ripple>
                        <span className="material-symbols-outlined"> power_settings_circle</span><span className="drawer-item-title"> Logout</span>
                    </li>
                </ul>

            </div>
            <md-dialog id="logout-dialog" >
                {/* <div slot="headline">
                    Logout
                </div> */}
                <form slot="content" id="logout-dialog-id" method="dialog">
                    <div className="create-dialog">
                        {/* <md-divider></md-divider> */}
                        <center>
                            <img style={{ width: '250px', height: '100px', }} src='./illustrations/logout-illu.svg' className="img-display"></img>
                        </center>
                        <br />
                        <p className="md-typescale-body-medium">Are you sure you want to log out?</p>
                    </div>
                </form>
                <div slot="actions">
                    <md-text-button form="logout-dialog-id" value="cancel">Cancel</md-text-button>
                    <md-filled-button onClick={handleLogout} form="logout-dialog-id" value="ok">Logout</md-filled-button>
                </div>
            </md-dialog>
        </>
    )

}

export default Sidebar;
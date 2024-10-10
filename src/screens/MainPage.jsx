// import { Card, CardContent, Subtitle2, H5, Body2, Body1, CardAction, CardHeader, Button } from 'ui-neumorphism'
// import WaveView from '../components/WaveView';
// import TopBar from '../components/TopBar';
// import 'ui-neumorphism/dist/index.css';
// import '../index2.css';
import './styles/mainpage.css';
import SideBar from '../components/SideBar';
import { useNavigate } from 'react-router-dom';
import { auth } from '../components/Firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from 'react';
import HomePage from './HomePage';
import ClassView from '../components/ClassView';
// import '../material-icons.css';

function MainPage() {
    let currentUser = null;
    let uid = null;
    const [classDocData, setClassDocData] = useState(null);
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
            console.log('signed in');

        } else {
            console.log('not signed in');
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
        console.log('classdata', classData);
        setClassDocData(classData);
        setCurrentPage('class');

    }
    const handleCurrentDrawerMenuItem = (currentItem) => {
        if (!(currentItem == 'logout' || currentItem == 'profile' || currentItem == 'settings'))
            setCurrentPage(currentItem);
        else
            console.log('item is ', currentItem);
        console.log('current user', currentUser);

    }

    return (
        <>
            <SideBar onMenuItemClick={handleCurrentDrawerMenuItem} activeItem={currentPage} />
            <div className="main-container">
                {currentPage === 'home' && <HomePage selectedClassCallback={openClassCallback} />}
                {currentPage === 'class' && <ClassView classData={classDocData} />}
                {/* {currentPage === 'home' ? <HomePage /> : <React.Fragment />} */}
            </div>
        </>


    );
}
export default MainPage;
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import { useState, useLayoutEffect, useEffect, useRef, useContext } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where } from "firebase/firestore";
import { Store } from 'react-notifications-component';
import './styles/classView.css';
import PeopleList from './PeopleList';
import QuizesList from './QuizesList';
import { AppContext, ClassContext } from '../AppContext';
import ClassRemarks from './ClassRemarks';
import { Button, Snackbar, Dialog, DialogContent, DialogActions, DialogContentText, DialogTitle, TextField, Chip } from "@mui/material";

function ClassView(props) {
    const [userData, setUserData] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);

    const { openedClass, setOpenedClass } = useContext(ClassContext);
    const [toggleClassIdDialog, setToggleClassIdDialog] = useState(false);
    const { currentUserData, currentUserInfo, setCurrentUserInfo, setCurrentUserData } = useContext(AppContext);

    const handleTabChange = (index) => {
        // const index = event.target.selected;
        console.log('selected is', index);

        setSelectedTab(index);
    };
    const toggleDialog = () => {
        setToggleClassIdDialog(true);
    }

    return (

        <>
            {openedClass !== null && currentUserData !== null ?
                <div className='main-class-container'>

                    <div className="class-banner">
                        <div className="class-img-banner" style={{ backgroundImage: 'url("./illustrations/collab-illu.jpg")' }}>
                            <div className="class-img-filter"></div>
                        </div>
                        <h1 className='class-banner-title'>{openedClass.className}</h1>
                        <p className='class-banner-desc'>{openedClass.classDesc}</p>
                        <div className="class-banner-actions">
                            <Button onClick={() => { setToggleClassIdDialog(true) }} sx={{ color: 'white', borderColor: 'white' }} variant="outlined">Class ID</Button>
                        </div>
                    </div>
                    <md-tabs class="class-tabs">
                        <md-primary-tab selected inline-icon onClick={() => handleTabChange(0)}>
                            <md-icon slot="icon">edit</md-icon>
                            Activities
                        </md-primary-tab>
                        <md-primary-tab inline-icon onClick={() => handleTabChange(1)}>
                            <md-icon slot="icon">people</md-icon>
                            People
                        </md-primary-tab>
                        <md-primary-tab inline-icon onClick={() => handleTabChange(2)}>
                            <md-icon slot="icon">score</md-icon>
                            Remarks
                        </md-primary-tab>
                    </md-tabs>
                    {selectedTab === 0 ?
                        <QuizesList />
                        : <></>
                    }
                    {selectedTab === 1 ?
                        <PeopleList userData={currentUserData} classData={openedClass} />
                        : <></>
                    }
                    {selectedTab === 2 ? <ClassRemarks /> : <></>}
                </div>
                :
                <>
                    <md-linear-progress indeterminate></md-linear-progress>
                </>}
            <Dialog open={toggleClassIdDialog}>
                <DialogTitle>Class Id</DialogTitle>
                <DialogContent>
                    ID:
                    <span><strong>
                        {' ' + openedClass.id}
                    </strong>
                    </span>
                    <p style={{ fontSize: '12px' }}>
                        Copy this class id and send it to your student to join this class or you can manually add them via email in the People Tab
                    </p>

                </DialogContent>
                <DialogActions>
                    <Button sx={{ color: 'grey' }} onClick={() => setToggleClassIdDialog(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    );
}

export default ClassView;
{/* <DotLottieReact
      src="path/to/animation.lottie"
      loop
      autoplay
    /> */}
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where } from "firebase/firestore";
import { Store } from 'react-notifications-component';
import './styles/classView.css';
import PeopleList from './PeopleList';
import QuizesList from './QuizesList';

function ClassView(props) {

    const [classData, setClassData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const handleTabChange = (index) => {
        // const index = event.target.selected;
        console.log('selected is', index);

        setSelectedTab(index);
    };
    useEffect(() => {
        if (auth.currentUser !== null)
            getUserData();
    }, [auth.currentUser]);
    useEffect(() => {
        setClassData(props.classData);
        // setUserData(props.currentUser);
        console.log('data ', classData, userData);

    }, [props.classData]);
    const getUserData = async () => {
        const currentUser = auth.currentUser;
        const filteredQuery = query(collection(db, 'users'), where('uid', '==', currentUser.uid));
        try {
            const querySnapshot = await getDocs(filteredQuery);
            querySnapshot.forEach((doc) => {
                setUserData(doc.data());
            });

        } catch (error) {
            console.log(error);
        }
    };

    return (

        <>
            {classData !== null && userData !== null ?
                <div className='main-class-container'>

                    <div className="class-banner">
                        <div className="class-img-banner" style={{ backgroundImage: 'url("./illustrations/collab-illu.jpg")' }}>
                            <div className="class-img-filter"></div>
                        </div>
                        <h1 className='class-banner-title'>{props.classData.className}</h1>
                        <p className='class-banner-desc'>{props.classData.classDesc}</p>
                        <div className="class-banner-actions">
                            <md-outlined-button>
                                <span slot='icon' className="material-symbols-outlined">edit</span>
                                Change Photo
                            </md-outlined-button>
                        </div>
                    </div>
                    <md-tabs class="class-tabs">
                        <md-primary-tab selected inline-icon onClick={() => handleTabChange(0)}>
                            <md-icon slot="icon">edit</md-icon>
                            Quizes
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
                        <PeopleList userData={userData} classData={classData} />
                        : <></>
                    }
                    {selectedTab === 2 ? 'tab 3' : <></>}
                </div>
                :
                <>
                    <md-linear-progress indeterminate></md-linear-progress>
                </>}
        </>
    );
}

export default ClassView;
{/* <DotLottieReact
      src="path/to/animation.lottie"
      loop
      autoplay
    /> */}
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import './styles/peopleList.css'
import { useImperativeHandle, useState, forwardRef, useLayoutEffect, useEffect, useRef, useContext, useReducer } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where } from "firebase/firestore"
import './styles/selectPeopleDialog.css';
import PeopleChip from './PeopleChip';
import { AppContext } from '../AppContext';

const PeopleSelection = forwardRef((props, ref) => {
    // let userData, classData, selectionTitle, cancelLabel, saveLabel, onSelectEvent, onSaveSelectionEvent;
    const { currentUserData } = useContext(AppContext);
    const [selectedPeople, setselectedPeople] = useState([]);
    const [participantsList, setParticipantsList] = useState([]);
    const [foundPeople, setFoundPeople] = useReducer((currentlist, newlist) => {
        const filteredList = newlist.filter(item => item.uid != currentUserData.uid);
        console.log('filtered lsit', filteredList);
        return filteredList;

    }, []);
    const [selectionTitle, setSelectionTitle] = useState('Select people');
    const [disableChip, setDisableChip] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const dialog = useRef(null);
    const userInput = useRef(null);
    useEffect(() => {
        if (props.selectionTitle)
            setSelectionTitle(props.selectionTitle);
        if (props.participantsList)
            setParticipantsList(props.participantsList);
    }, [])
    useImperativeHandle(ref, () => ({
        showDialog, closeDialog, showLoading, hideLoading,
    }));
    const showDialog = () => {
        dialog.current.show();
    }
    const closeDialog = () => {
        userInput.current.value = '';
        dialog.current.close();
        setTimeout(() => {
            setFoundPeople([]);
            setselectedPeople([]);
        }, 500);
    }
    const showLoading = () => {
        setLoading(true);
        setDisableChip(true);
    }
    const hideLoading = () => {
        setLoading(false);
        setDisableChip(false);
    }
    const disableChips = () => {
        setDisableChip(true);
    }
    const cancelDialog = () => {
        if (props.onCancelEvent)
            props.onCancelEvent();
        closeDialog();
    }
    const saveSelection = (event) => {
        console.log('save');
        // event.preventDefault();
        if (props.onSaveSelectionEvent) {
            props.onSaveSelectionEvent(selectedPeople);
            console.log('save  acalled');

        } else {
            console.log(' sve event', props.onSaveSelectionEvent);

        }
        // dialog.current.close();
    }
    const searchPeopleQuery = async (searchTerm) => {
        let alreadyInList = props.participantsList.map((item) => (item.uid));
        console.log('alreadyInList', alreadyInList);

        try {
            const q = query(collection(db, "users"),
                where('__name__', 'not-in', alreadyInList),
                where("email", ">=", searchTerm),
                where("email", "<", searchTerm + "\uf8ff")
            );
            const querySnapshot = await getDocs(q);
            setFoundPeople(querySnapshot.docs.map((doc) => (doc.data())));
        } catch (error) {
            setFoundPeople([]);
            console.log('error finding people', error);

        }
    };
    const handlePeopleInput = (event) => {
        const searchKey = event.target.value;
        if (searchKey == '') {
            setFoundPeople([]);
            return;
        }
        searchPeopleQuery(searchKey);
    };
    const handleRemoveChip = (item) => {
        console.log('removing item', item);

        if (selectedPeople.find(foundItem => foundItem.uid === item.uid)) {
            const newSelectedPeople = [...selectedPeople];
            newSelectedPeople.splice(selectedPeople.indexOf(item), 1);
            setselectedPeople(newSelectedPeople);
        }

    }
    const chipPeopleSelectedHandler = (item) => {
        console.log(item.email);

        if (selectedPeople.find(foundItem => foundItem.uid === item.uid)) {
            const newSelectedPeople = [...selectedPeople];
            newSelectedPeople.splice(selectedPeople.indexOf(item), 1);
            setselectedPeople(newSelectedPeople);
        }
        else {
            const newSelectedPeople = selectedPeople.concat(item);
            setselectedPeople(newSelectedPeople);
            console.log('item not exist', selectedPeople.indexOf(item), newSelectedPeople);
        }
        // event.target.remove();
    }

    return (
        <>
            <md-dialog ref={dialog} id="select-people-dialog" >
                <div slot="headline" style={{ fontFamily: 'Open Sans' }}>
                    {selectionTitle}
                </div>
                <form slot="content" id="select-people-dialog-id" method="dialog">
                    <div className="select-dialog">

                        <md-chip-set class='input-class-peoples' aria-label="Action">
                            {selectedPeople.map((item, index) => (
                                (!disableChip) ?
                                    <PeopleChip id={item.uid} imgUrl={item.imgUrl} key={item.uid} onRemove={() => handleRemoveChip(item)} label={item.email} />
                                    :
                                    <md-input-chip key={item.uid} disabled avatar label={item.email}>
                                        <img slot="icon" src={item.imgUrl} />
                                    </md-input-chip>
                            ))}
                        </md-chip-set>
                        {
                            isLoading ?
                                <md-linear-progress indeterminate></md-linear-progress>
                                : <></>
                        }

                        <span><input ref={userInput} placeholder='Enter a email' type="text" className='input-student' onChange={handlePeopleInput} /></span>

                        <br />
                        <md-chip-set class='input-class-people' aria-label="Actions">
                            {foundPeople.map((item, index) => (
                                selectedPeople.find(foundItem => foundItem.uid === item.uid) ?
                                    <></>

                                    :
                                    // <md-input-chip key={item.uid} avatar onClick={() => chipPeopleSelectedHandler(item)} label={item.email} >
                                    //     <img slot="icon" src={item.imgUrl} />
                                    // </md-input-chip>
                                    !disableChip ?
                                        <PeopleChip id={item.uid} imgUrl={item.imgUrl} key={item.uid} onClick={() => chipPeopleSelectedHandler(item)} label={item.email} />
                                        : <></>
                            ))}
                        </md-chip-set>

                    </div>
                </form>
                <div slot="actions">
                    <md-text-button type='button' onClick={cancelDialog} value='cancel'>{props.cancelLabel}</md-text-button>
                    <md-text-button id='pepsSelBtn' onClick={saveSelection} >{props.saveLabel}</md-text-button>
                </div>
            </md-dialog>
        </>
    );
});

export default PeopleSelection;
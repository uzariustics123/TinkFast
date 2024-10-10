import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import './styles/peopleList.css'
import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where } from "firebase/firestore"
function PeopleSelection({ selectionTitle, cancelLabel, saveLabel, onSelect, onSaveSelection }) {
    const [selectedPeople, setselectedPeople] = useState([]);
    const [people, setPeople] = useState([]);

    return (
        <>
            <md-dialog id="add-people-dialog" >
                <div slot="headline" style={{ fontFamily: 'Open Sans' }}>
                    Invite students in class
                </div>
                <form slot="content" id="create-dialog-id" method="dialog">
                    <div className="create-dialog">
                        <input placeholder='Enter a name or email' type="text" className='input-student' onChange={handlePeopleInput} />
                        <md-chip-set class='input-class-people' aria-label="Actions">
                            {peopleToAdd.map((item, index) => (
                                <md-input-chip disabled avatar label='Input chip with avatar'>
                                    <img
                                        slot="icon"
                                        src="https://lh3.googleusercontent.com/a/default-user=s48" />
                                </md-input-chip>
                            ))}
                            <md-input-chip avatar label='Input chip with avatar' remove={() => { console.log('closed') }}>
                                <img
                                    slot="icon"
                                    src="https://lh3.googleusercontent.com/a/default-user=s48" />
                            </md-input-chip>
                        </md-chip-set>
                    </div>
                </form>
                <div slot="actions">
                    <md-text-button type='button' onClick={() => document.getElementById('add-people-dialog').close()} value='cancel'>Cancel</md-text-button>
                    <md-text-button>Invite</md-text-button>
                </div>
            </md-dialog >
        </>
    );
}

export default PeopleSelection;
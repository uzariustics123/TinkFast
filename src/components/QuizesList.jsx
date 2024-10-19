import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import './styles/quizesList.css';
import { useImperativeHandle, useState, forwardRef, useLayoutEffect, useEffect, useRef } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where } from "firebase/firestore"

function QuizesList() {
    const handleTabChange = (index) => {

    }
    return (
        <>
            <div className="quiz-tab-container">

                <md-tabs class="quiz-tabs">
                    <md-secondary-tab selected inline-icon onClick={() => handleTabChange(0)}>
                        {/* <md-icon slot="icon">edit</md-icon> */}
                        Prelim
                    </md-secondary-tab>
                    <md-secondary-tab inline-icon onClick={() => handleTabChange(1)}>
                        {/* <md-icon slot="icon">people</md-icon> */}
                        Midterm
                    </md-secondary-tab>
                    <md-secondary-tab inline-icon onClick={() => handleTabChange(2)}>
                        {/* <md-icon slot="icon">score</md-icon> */}
                        Finals
                    </md-secondary-tab>
                </md-tabs>
            </div>
            <md-fab class='add-quiz-fab' label="Add quiz" variant="primary" aria-label="Edit">
                <md-icon slot="icon">add</md-icon>
            </md-fab>
        </>
    );
}

export default QuizesList;
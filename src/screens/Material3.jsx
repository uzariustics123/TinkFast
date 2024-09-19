import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/elevated-button';
import '@material/web/chips/chip-set';
import '@material/web/chips/filter-chip';
import '@material/web/chips/assist-chip';
import '@material/web/chips/input-chip';
import '@material/web/checkbox/checkbox.js';
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import WaveView from '../components/WaveView';
import { auth } from '../components/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

function Material3() {
    return (
        <>
            <div>
                <h1 color="#fff">Register</h1>
                <md-filled-button>
                    <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e8eaed"><path d="M216-288q-20.4 0-34.2-13.8Q168-315.6 168-336v-72H96v-144h72v-72q0-20.4 13.8-34.2Q195.6-672 216-672h600q20.4 0 34.2 13.8Q864-644.4 864-624v288q0 20.4-13.8 34.2Q836.4-288 816-288H216Z" /></svg>
                    Back
                </md-filled-button>
                <md-filled-button>
                    <span slot="icon" style={{ fontSize: '18px' }} className="material-symbols-outlined">send</span>
                    Back
                </md-filled-button>
                <md-filled-button>Complete
                    <svg slot="icon" viewBox="0 0 48 48"><path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h13.95v3H9v30h30V25.05h3V39q0 1.2-.9 2.1-.9.9-2.1.9Zm10.1-10.95L17 28.9 36.9 9H25.95V6H42v16.05h-3v-10.9Z" /></svg>
                </md-filled-button>
                <md-checkbox touch-target="wrapper"></md-checkbox>
                <md-checkbox touch-target="wrapper" checked></md-checkbox>
                <md-checkbox touch-target="wrapper" label="teast" indeterminate></md-checkbox>
                <label>
                    <md-checkbox touch-target="wrapper"></md-checkbox>
                    Checkbox one
                </label>
                <md-checkbox id="checkbox-two" touch-target="wrapper"></md-checkbox>
                <label for="checkbox-two">Checkbox two</label>
                <md-elevated-button>Elevated</md-elevated-button>
                <md-chip-set>
                    <md-assist-chip label="Assist"></md-assist-chip>
                    <md-filter-chip label="Filter"></md-filter-chip>
                    <md-input-chip label="Input"></md-input-chip>
                    <md-suggestion-chip label="Suggestion"></md-suggestion-chip>
                </md-chip-set>
            </div>
        </>



    );
}
export default Material3;
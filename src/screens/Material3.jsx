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
                <md-outlined-button>Back</md-outlined-button>
                <md-filled-button>Complete</md-filled-button>
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
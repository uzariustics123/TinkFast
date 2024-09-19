// import 'ui-neumorphism/dist/index.css'
import './styles/ui-neumorph.css'
import { Store } from 'react-notifications-component';
import { useNavigate } from "react-router-dom";
// import '@material/web/button/filled-button.js';
// import '@material/web/button/outlined-button.js';
// import '@material/web/button/elevated-button'; 
// import '@material/web/checkbox/checkbox.js';
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import WaveView from '../components/WaveView';
import { auth, db } from '../components/Firebase';
import { collection, addDoc } from "firebase/firestore";
import { Card, CardContent, Subtitle2, H5, Body2, Body1, CardAction, CardHeader, Button, TextField, H1 } from 'ui-neumorphism'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import './styles/register.css';

function Register() {
    // const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const navigate = useNavigate();
    // useEffect(() => {
    //     if (auth.currentUser != null) {
    //         window.location = './main';
    //         console.log(auth.currentUser);
    //     }
    // }, [auth.currentUser]);

    let [email, setEmail] = useState('');
    let [studentID, setStudentID] = useState('');
    let [pass, setPass] = useState('');
    let [firstName, setFname] = useState('');
    let [midName, setMname] = useState('');
    let [lastName, setLname] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);
    let [confirmPass, setConfirmPass] = useState('');
    const regWithEmailPass = (e) => {
        e.preventDefault();
        console.log(email, pass);

        if (checkValidFields()) {
            setLoadingForm(true);
            createUserWithEmailAndPassword(auth, email, pass)
                .then(async (userCredential) => {
                    // Signed up 
                    const user = userCredential.user;
                    setLoadingForm(false);
                    try {
                        const docRef = await addDoc(collection(db, "users"), {
                            firstname: firstName,
                            lastname: lastName,
                            middlename: midName,
                            studentID: studentID,
                            uid: user.uid
                        });
                        console.log("User added with ID: ", docRef.id);
                        handleLogout(auth);

                    } catch (e) {
                        console.error("Error adding user: ", e);
                        Store.addNotification({
                            title: "Error: " + e.code,
                            message: e.message,
                            type: "danger",
                            container: "top-center",
                            animationIn: ["animate__animated", "animate__tada"],
                            // animationIn: ["animate__animated", "animate__rubberBand"],
                            animationOut: ["animate__animated", "animate__backOutDown"],
                            dismiss: {
                                duration: 5000,
                                onScreen: true
                            }
                        });
                    }
                    // ...
                })
                .catch((error) => {
                    setLoadingForm(false);
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    Store.addNotification({
                        title: "Error: " + errorCode,
                        message: errorMessage,
                        type: "danger",
                        container: "top-center",
                        animationIn: ["animate__animated", "animate__tada"],
                        // animationIn: ["animate__animated", "animate__rubberBand"],
                        animationOut: ["animate__animated", "animate__backOutDown"],
                        dismiss: {
                            duration: 5000,
                            onScreen: true
                        }
                    });
                    // ..
                });
        } else {


        }
    }
    const handleLogout = (theAuth) => {
        signOut(theAuth).then(() => {
            // Sign-out successful.
            Store.addNotification({
                title: "Nice!",
                message: "Your account has been successfully created. Log in with it!",
                type: "success",
                container: "top-center",
                // animationIn: ["animate__animated", "animate__tada"],
                animationIn: ["animate__animated", "animate__rubberBand"],
                animationOut: ["animate__animated", "animate__backOutDown"],
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
            navigate('/login');
            console.log("User signed out successfully");
        }).catch((error) => {
            // An error happened during sign out
            console.error("Internal error ", error);
            Store.addNotification({
                title: "Error: " + error.code,
                message: error.message,
                type: "danger",
                container: "top-center",
                animationIn: ["animate__animated", "animate__tada"],
                // animationIn: ["animate__animated", "animate__rubberBand"],
                animationOut: ["animate__animated", "animate__backOutDown"],
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
        });
    };
    const checkValidFields = () => {
        let errMsg = '';
        if (!email.endsWith('@gadtc.edu.ph')) {
            errMsg = 'Make sure to have your institutional email. e.g: @gadtc.edu.ph';
        }
        else if (firstName.trim() === '') {
            errMsg = 'Please provide your first name';
        }
        else if (lastName.trim() === '') {
            errMsg = 'Please provide your last name';
        }
        else if (studentID.trim() === '') {
            errMsg = 'Please provide your Student ID';
        }
        else if (pass.length < 6) {
            errMsg = 'Password must be 6 atleast characters long';
        }
        else if (pass !== confirmPass) {
            errMsg = 'Password and Confirm Password must match.';
        }
        if (errMsg !== '') {
            Store.addNotification({
                title: "Oops!",
                message: errMsg,
                type: "warning",
                container: "bottom-center",
                // animationIn: ["animate__animated", "animate__tada"],
                animationIn: ["animate__animated", "animate__rubberBand"],
                animationOut: ["animate__animated", "animate__backOutDown"],
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
            return false;
        }
        console.log('pass length', pass.length);

        return true;

    }

    const handleEmailInputChange = (e) => {
        setEmail(e.event.target.value);
    }
    const handleSIDInputChange = (e) => {
        setStudentID(e.event.target.value);
    }
    const handleFnameInputChange = (e) => {
        setFname(e.event.target.value);
    }
    const handleMnameInputChange = (e) => {
        setMname(e.event.target.value);
    }
    const handleLnameInputChange = (e) => {
        setLname(e.event.target.value);
    }
    const handlePassInputChange = (e) => {
        setPass(e.event.target.value);
    }
    const handleConfirmPassInputChange = (e) => {
        setConfirmPass(e.event.target.value);
    }

    return (
        <>
            <div className="reg-container">
                <div className='container'>
                    {/* <Card className={'px-4 py-4'}>
            </Card > */}
                    <h1 className='reg-h1'>TinkFast</h1>
                    <h4 className='reg-h4'>Create an account</h4>
                    <Player className='brain-anim' autoplay loop src="/anims/brain-sprocket-style.json" />

                    <div className="wave" style={{ zIndex: '100' }}>
                        <WaveView register={true} />
                    </div>
                </div >
                <form className='reg-form' action={regWithEmailPass}>
                    <div className='input-container'>
                        <TextField loading={loadingForm} onChange={handleEmailInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>email</span>} type='email' label={'Email'} className=''></TextField>

                        <TextField loading={loadingForm} onChange={handleSIDInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>id_card</span>} type='text' label={'Student ID'} className=''></TextField>

                        <TextField loading={loadingForm} onChange={handleFnameInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>person</span>} type='text' label={'First Name'} className=''></TextField>

                        <TextField loading={loadingForm} onChange={handleMnameInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>contact_page</span>} type='text' label={'Middle Name'} className=''></TextField>

                        <TextField loading={loadingForm} onChange={handleLnameInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>contact_page</span>} type='text' label={'Last Name'} className=''></TextField>

                        <TextField loading={loadingForm} onChange={handlePassInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>key</span>} type={'password'} label={'Password'} className=''></TextField>

                        <TextField loading={loadingForm} onChange={handleConfirmPassInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>verified_user</span>} type={'password'} label={'Confirm Password'} className=''></TextField>

                        <Button onClick={regWithEmailPass} style={{ width: '200px', justifySelf: 'center', alignSelf: 'center', marginTop: '10px' }} size='large' color='var(--primary-color)' rounded={true}>Register &nbsp;<span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>arrow_forward</span></Button>
                        <br />
                        <br />
                    </div>
                </form>
            </div>
        </>



    );
}
export default Register;
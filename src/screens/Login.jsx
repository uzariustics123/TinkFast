import 'ui-neumorphism/dist/index.css'
import { Chip } from 'ui-neumorphism'
import { Card, CardContent, Subtitle2, H5, Body2, Body1, CardAction, CardHeader, Button, TextField, H1 } from 'ui-neumorphism'
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import WaveView from '../components/WaveView';
import { Divider } from 'ui-neumorphism'
import { auth } from '../components/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './styles/login.css'
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Store } from 'react-notifications-component';





function Login(e) {
    const navigate = useNavigate();
    useEffect(() => {
        if (auth.currentUser != null) {
            navigate('/main');
            console.log(auth.currentUser);
        }
    }, [auth.currentUser]);
    let [email, setEmail] = useState('');
    let [pass, setPass] = useState('');
    const loginWithEmailPass = (e) => {
        e.preventDefault();
        console.log(email, pass);

        if (isValidEmail(email) && isValidPassword(pass)) {
            signInWithEmailAndPassword(auth, email, pass)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    console.log(user);
                    // ...
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                });
        } else {
            console.log('invalid email');

        }
    }
    const isValidEmail = () => {
        return email.endsWith('@gadtc.edu.ph');
    }

    const isValidPassword = () => {
        return pass.length >= 6;
    }

    const handleEmailInputChange = (e) => {
        setEmail(e.event.target.value);
    }
    const handlePassInputChange = (e) => {
        setPass(e.event.target.value);
    }
    const gotoReg = (e) => {
        navigate('/register');
        console.log('asdf');

    }
    return (
        <div className='login-container'>
            {/* <Card className={'px-4 py-4'}>
            </Card > */}
            <h1 className='login-h1'>TinkFast</h1>
            <h4 className='login-h4'>Login to your account</h4>
            <Player autoplay loop src="https://lottie.host/c91576a5-16a4-425c-a788-45a0e057830c/32n4HB4iPV.json" style={{ marginTop: '-110px', marginBottom: '-80px', height: '300px', width: '300px' }} />
            <form className='login-form' action={loginWithEmailPass}>
                <div className='input-container'>
                    <TextField onChange={handleEmailInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-icons" style={{ color: 'var(--primary)' }}>email</span>} type='email' label={'Email'} className=''></TextField>
                    <TextField onChange={handlePassInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-icons" style={{ color: 'var(--primary)' }}>key</span>} type={'password'} label={'Password'} className=''></TextField>
                    <Button onClick={loginWithEmailPass} style={{ width: '200px', justifySelf: 'center', alignSelf: 'center', marginTop: '10px' }} size='large' color='var(--primary-color)' rounded={true}>LOG IN &nbsp;<span className="material-icons" style={{ color: 'var(--primary)' }}>chevron_right</span></Button>
                    <Divider dense style={{ width: '100%', marginTop: '20px' }} />
                    <Chip link='/register' className={'reg-chip'} type='info'> Create an Account &nbsp; <span style={{ fontSize: '20px' }} className='material-icons'>chevron_right</span></Chip>
                </div>
            </form>
            <div className="login-wave">
                <WaveView />
            </div>
        </div >


    );
}
export default Login;
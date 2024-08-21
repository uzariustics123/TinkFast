import { Card, CardContent, Subtitle2, H5, Body2, Body1, CardAction, CardHeader, Button, TextField, H1 } from 'ui-neumorphism'
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import WaveView from '../components/WaveView';
import { auth } from '../components/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './styles/login.css'
import { useState } from 'react';





function Login() {
    let [email, setEmail] = useState('');
    let [pass, setPass] = useState('');
    const loginWithEmailPass = () => {
        console.log(email, pass);

        if (isValidEmail(email) && isValidPassword(pass)) {

        }
    }
    const isValidEmail = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
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
    return (
        <div className='container'>
            {/* <Card className={'px-4 py-4'}>
            </Card > */}
            <h1 className='login-h1'>TinkFast</h1>
            <h4 className='login-h4'>Login to your account</h4>
            <Player autoplay loop src="https://lottie.host/c91576a5-16a4-425c-a788-45a0e057830c/32n4HB4iPV.json" style={{ marginTop: '-150px', marginBottom: '-100px', height: '400px', width: '400px' }} />
            <TextField onChange={handleEmailInputChange} rules={'isValidEmail'} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-icons" style={{ color: 'var(--primary)' }}>email</span>} type='email' label={'Email'} className=''></TextField>
            <TextField onChange={handlePassInputChange} width={200} style={{ alignSelf: 'center' }} prepend={<span className="material-icons" style={{ color: 'var(--primary)' }}>key</span>} type={'password'} label={'Password'} className=''></TextField>
            <Button onClick={loginWithEmailPass} style={{ width: '200px', justifySelf: 'center', alignSelf: 'center', marginTop: '10px' }} size='large' color='var(--primary-color)' rounded={true}>LOG IN &nbsp;<span className="material-icons" style={{ color: 'var(--primary)' }}>arrow_forward</span></Button>
            <div className="login-wave">
                <WaveView />
            </div>
        </div >


    );
}
export default Login;
import { Card, CardContent, Subtitle2, H5, Body2, Body1, CardAction, CardHeader, Button } from 'ui-neumorphism'
import WaveView from '../components/WaveView';
import './styles/login.css'
function Login() {
    return (
        <div className='container'>
            <h1 color="#fff">Login</h1>
            <Card>
                <CardContent>
                    <Subtitle2 secondary style={{ marginBottom: '4px' }} >
                        Word of the day
                    </Subtitle2>
                    <H5>
                        be<span>•</span>nev<span>•</span>o<span>•</span>lent
                    </H5>
                    <Subtitle2 secondary style={{ marginBottom: '12px' }} >
                        adjective
                    </Subtitle2>
                    <Body2>
                        well meaning and kindly.
                        <br />
                        "a benevolent smile"
                    </Body2>
                </CardContent>
                <CardAction>
                    <Button text color='var(--primary)'>
                        Learn More
                    </Button>
                </CardAction>
            </Card>
            <div className="login-wave">
                <WaveView />
            </div>
        </div>


    );
}
export default Login;
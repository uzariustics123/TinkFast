import { Card, CardContent, Subtitle2, H5, Body2, Body1, CardAction, CardHeader, Button } from 'ui-neumorphism'
import WaveView from '../components/WaveView';
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';
import { useNavigate } from 'react-router-dom';
import { auth } from '../components/Firebase';

function MainPage() {
    const navigate = useNavigate();
    useEffect(() => {
        if (auth.currentUser == null) {
            navigate('/login');
            console.log(auth.currentUser);
        }
    }, [auth.currentUser]);
    return (
        <>
            {/* <TopBar /> */}
            <SideBar />
        </>


    );
}
export default MainPage;
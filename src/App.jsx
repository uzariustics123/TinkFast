import { useContext, useState, useEffect, Suspense, lazy } from 'react'
import './App.css'
import 'material-symbols';
import 'animate.css';
import 'react-notifications-component/dist/theme.css'
import 'material-icons/iconfont/material-icons.css';
const Login = lazy(() => import('./screens/Login'));
const MainPage = lazy(() => import('./screens/MainPage'));
const Register = lazy(() => import('./screens/Register'));
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PreLoader from './screens/PreLoader.jsx'
import Material3 from './screens/Material3.jsx';
import { ReactNotifications } from 'react-notifications-component';
import { AppContext } from './AppContext.jsx';

function App() {
  const [loading, setLoading] = useState(true);
  const [drawerActiveItem, setDrawerActiveItem] = useState('Users');
  const [currentUserData, setCurrentUserData] = useState({});
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [openSnackbar, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  useEffect(() => {
    // Simulate a data loading delay
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Adjust the timeout to your needs
  }, []);
  return (
    <>
      <AppContext.Provider value={{
        currentUserData,
        setCurrentUserData,
        backdropOpen,
        setBackdropOpen,
        openSnackbar,
        setSnackbarOpen,
        snackbarMsg,
        setSnackbarMsg,
        drawerActiveItem,
        setDrawerActiveItem,
      }}>

        <ReactNotifications />
        <Suspense fallback={<PreLoader />}>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={<MainPage />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/material3" element={<Material3 />} />
              <Route path="/preloader" element={<PreLoader />} />
            </Routes>
          </Router>
        </Suspense>
      </AppContext.Provider>
    </>
  )
}

export default App

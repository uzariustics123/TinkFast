import { useState, useEffect, Suspense, lazy } from 'react'
// import { overrideThemeVariables } from 'ui-neumorphism'
// import './App.css'
// import 'ui-neumorphism/dist/index.css'
import 'animate.css';
import 'react-notifications-component/dist/theme.css'
const Login = lazy(() => import('./screens/Login'));
const MainPage = lazy(() => import('./screens/MainPage'));
const Register = lazy(() => import('./screens/Register'));
import { auth } from './components/Firebase.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PreLoader from './screens/PreLoader.jsx'
import Material3 from './screens/Material3.jsx';
import { ReactNotifications } from 'react-notifications-component';

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Simulate a data loading delay
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Adjust the timeout to your needs
  }, []);
  return (
    <>
      <ReactNotifications />
      <Suspense fallback={<PreLoader />}>
        <Router>
          <Routes>
            <Route path="/*" element={<Login />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/material3" element={<Material3 />} />
            <Route path="/preloader" element={<PreLoader />} />
          </Routes>
        </Router>
      </Suspense>
    </>
  )
}

export default App

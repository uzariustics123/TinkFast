import { useState } from 'react'
import { overrideThemeVariables } from 'ui-neumorphism'
// import './App.css'
// import 'ui-neumorphism/dist/index.css'
import Login from "./screens/Login.jsx"
import Register from "./screens/Register.jsx"
import MainPage from "./screens/MainPage.jsx"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0)
  overrideThemeVariables({
    '--light-bg': '#E4EBF5',
    '--light-bg-dark-shadow': '#bec8e4',
    '--light-bg-light-shadow': '#ffffff',
    '--dark-bg': '#444444',
    '--dark-bg-dark-shadow': '#363636',
    '--dark-bg-light-shadow': '#525252',
    '--primary': '#2979ff',
    '--primary-dark': '#2962ff',
    '--primary-light': '#82b1ff'
  })
  return (
    <>
      <Router>
        <div className="main">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App

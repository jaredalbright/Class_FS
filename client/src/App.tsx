import { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import IUser from './types/user.type';
import { Route, Routes } from 'react-router-dom';
import Login from "./components/login/Login";
import Register from "./components/login/Register";
import Home from './components/Home';
import { getCurrentUser, logout } from './services/auth.service';
import Header from './components/Header';

function App() {
  const [currentUser, setCurrentUser] = useState<IUser | undefined>(undefined);
  useEffect(() => {
    const user = getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }

    return () => {

    }
  }, []);

  const logOut = () => {
    logout(); // Auth service import
    setCurrentUser(undefined);
  };

  return (
    <>
      <div>
        <Header logOut={logOut} currentUser={currentUser}/>
        <div>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
          </Routes>
        </div>
      
      </div>
    </>
  )
}

export default App

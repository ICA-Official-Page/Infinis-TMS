import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import './assets/css/App.css';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import URI from './utills';
import Signup from './pages/Signup';
import SessionEndWarning from './components/SessionEndWarning';
import toast from 'react-hot-toast';
import { setSessionWarning } from './Redux/userSlice';

function App() {
  const [loading, setLoading] = useState(true);

  const { sessionWarning, user, theme } = useSelector(store => store.user);
  const [superAdmin, setSuperAdmin] = useState(false);
  const dispatch = useDispatch();

  const verifySuperAdmin = async () => {
    try {
      const res = await axios.get(`${URI}/auth/verifysuperadmin`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.data.notAuthorized) {
        dispatch(setSessionWarning(true))
      }

      setSuperAdmin(res.data.success);
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.notAuthorized) {
          dispatch(setSessionWarning(true))
        }
        // else {
        //   toast.error(err.response.data.message || "Something went wrong");
        // }
      } else {
        toast.error("Something went wrong");
      }
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    verifySuperAdmin();
  }, []);

  return (
    <>
      <Router>
        {sessionWarning && <SessionEndWarning />}
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path='/signup' element={<Signup />} />
          <Route path="/dashboard/*" element={
            user ? <Dashboard /> : <Navigate to="/" />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConfirmEmail from './pages/confirm';
import UpdatePasswordPage from './pages/update-password';
import Home from './pages/home';
import Dashboard from './pages/dashboard'
import Login from './pages/login';


export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/confirm" element={<ConfirmEmail />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        
      </Routes>
  );
}

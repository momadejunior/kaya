import React from 'react';
import {Routes, Route } from 'react-router-dom';
import ConfirmEmail from './pages/confirm';
import UpdatePasswordPage from './pages/update-password';
import Home from './pages/home';
import Dashboard from './pages/dashboard'
import Login from './pages/login';
import SignUp from './pages/signup';
import SignIn from './pages/signin';
import Profile from './pages/perfil';
import MyPosts from './pages/MyPosts';
import Feed from './pages/feed';
import Detalhes from './pages/detalhes';
import Reportar from './pages/reportar';
import Soccer3v3 from './pages/game';
import AboutApp from './pages/sobre';
import Notificacoes from './pages/notificacao';
import EditarPerfil from './pages/editar';
import ResetPassword from './pages/resetPassword';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/confirm" element={<ConfirmEmail />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path='/perfil' element={<Profile />} />
      <Route path='/publicacoes' element={<MyPosts />} />
      <Route path='/feed' element={<Feed />} />
      <Route path="feed/:id/detalhes" element={<Detalhes />} />
      <Route path="/reportar" element={<Reportar />} />
      <Route path="/game" element={<Soccer3v3 />} />
      <Route path="/sobre" element={<AboutApp />} />
      <Route path="/perfil/:id/Notificacoes" element={<Notificacoes />} />
      <Route path="/perfil/:id/editar" element={<EditarPerfil />} />
      <Route path="/reportar" element={<EditarPerfil />} />
      <Route path="/redefinir-password" element={<ResetPassword />} />
      


    </Routes>
  );
}

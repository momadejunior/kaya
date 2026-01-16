import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import {
  BrowserRouter as Router,
} from 'react-router-dom';
import Navbar from './components/navbar';
import BottomNav from './components/BottomNav';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Navbar />
      <App />
      <BottomNav/>
    </Router>
  </React.StrictMode>
);

// Medição de performance (opcional)
reportWebVitals();

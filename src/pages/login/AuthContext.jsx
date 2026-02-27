import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import GestionMateriel from './pages/GestionMateriel';
import Historique from './pages/Historique';
import Rapport from './pages/Rapport';
import AjoutMateriel from './pages/AjoutMateriel';
import ListeMaintenance from './pages/ListeMaintenance';

import Menu from './Menu';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      {token && <Menu />}
      <div style={{ marginLeft: token ? '200px' : 0, transition: 'margin 0.3s' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/gestion-materiel" element={<PrivateRoute><GestionMateriel /></PrivateRoute>} />
          <Route path="/ajout" element={<PrivateRoute><AjoutMateriel /></PrivateRoute>} />
          <Route path="/HIstoire" element={<PrivateRoute><Historique /></PrivateRoute>} />
          <Route path="/listeMain" element={<PrivateRoute><ListeMaintenance /></PrivateRoute>} />
          <Route path="/Raport" element={<PrivateRoute><Rapport /></PrivateRoute>} />
          <Route path="*" element={<Navigate to={token ? '/gestion-materiel' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

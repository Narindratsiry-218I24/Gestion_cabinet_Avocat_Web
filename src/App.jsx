import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Materiel from './pages/Affaire/Ajout';
import Modifier from './pages/Affaire/modifier';
import Affectation from './pages/Rendez_Vous/rendez';
import Historique from './pages/Rendez_Vous/Affectations';
import Menu from './pages/Menu';
import DASH from './pages/Dashboard';
import LISTE from './pages/Affaire/LISTE';
import ListeAffect from './pages/Archive/paiement';
import ListeMaine from './pages/Archive/Affaire';
import ListeMain from './components/maintenanceliste';
import CreateMain from './components/paiement';
import Raport from './pages/Affaire/LISTE';
import { BiMenu } from 'react-icons/bi';
import PrivateRoute from './pages/login/PrivateRoute';
import LoginPage from './pages/login/Login';
import { 
  BiMagnet,BiBox
} from 'react-icons/bi';
import User from './pages/Avocat/ajoutUser';
// Fonction manuelle pour décoder le JWT
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erreur de décodage du JWT:', e);
    return null;
  }
};

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userType, setUserType] = useState(null);
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Mapping des routes aux titres de page
  const pageTitles = {
    '/dash': 'Accueil',
    '/ajout': 'Ajout Matériel',
    '/ajout/edit/:id': 'Modifier Matériel',
    '/Equi': 'Affectation',
    '/HIstoire': 'Historique',
    '/ListeMain': 'Maintenance',
    '/creationMain': 'Créer  Maintenance',
    '/liste': 'Rapports de Materiel',
    '/Raport': 'Rapports',
    '/listeAffecte': 'Historique Affectation',
    '/listeMaine': 'Historique Maintenance'
  };

  // Obtenir le titre de la page actuelle
  const getPageTitle = () => {
    const path = Object.keys(pageTitles).find(key => 
      key.includes(':id') ? location.pathname.startsWith('/ajout/edit/') : location.pathname === key
    );
    return pageTitles[path] || 'Gestion Matériel';
  };

  useEffect(() => {
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        setUserType(decoded.type_user);
      }
    } else {
      setUserType(null);
    }

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarVisible(!mobile && location.pathname !== '/login');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [token, location.pathname]);

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="d-flex flex-column">
        <header className="header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6'
        }}>
          <div className="header-left" style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
            {isMobile  && (
              <button
                className="toggle-mobile-btn"
                onClick={toggleSidebar}
                style={{
                  backgroundColor: 'transparent',
                  color: 'black',
                  border: 'none',
                  padding: '0.5rem',
                  marginRight: '1rem'
                }}
              >
                <BiMenu size={30} />
              </button>
            )}
            <h1 className="header-title" style={{ fontSize: isMobile ? '0rem' : '1rem', margin: 0 }}>
            <img
              src="../src/images/logo.png"
              alt="DST Logo"
              style={{
                height: isMobile ? '20px' : '40px',
                width: 'auto',
                maxWidth: '100px'
              }}
            />
              Gestion du Cabinet d'Avocat
            </h1>
          </div>
          <div className="header-center" style={{ flex: '1', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '1rem' : '1.25rem', margin: 0, color: '#343a40'}}>
                
            </h2>
          </div>
          <div className="header-right" style={{ flex: '1', display: 'flex', justifyContent: 'flex-end' }}>
            <img
              src="../src/images/Lg.jpg"
              alt="DST Logo"
              style={{
                height: isMobile ? '20px' : '40px',
                width: 'auto',
                maxWidth: '100px'
              }}
            />
          </div>
        </header>
      
      <div className="main-container d-flex">
      
          <div className={`sidebar ${!sidebarVisible ? 'hidden' : ''}`}>
            <Menu
              sidebarVisible={sidebarVisible}
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
              userType={userType}
            />
          </div>
      
        <div className="main-content" style={{ flex: 1, padding: '1rem' }}>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={token ? '/dash' : 'dash'} />}
            />
            <Route path="/dash" element={<DASH />} />
            <Route
              path="/ajout"
              element={
              
                  <Materiel />
             
              }
            />
            <Route
              path="/ajout/edit/:id"
              element={
               
                  <Modifier />
               
              }
            />
            <Route
              path="/Equi"
              element={
              
                  <Affectation />
              
              }
            />
            <Route
              path="/HIstoire"
              element={
              
                  <Historique />
              
              }
            />
            <Route
              path="/ListeMain"
              element={
               
                  <ListeMain />
               
              }
            />
            <Route
              path="/creationMain"
              element={
               
                  <CreateMain />
              
              }
            />
            <Route
              path="/liste"
              element={
               
                  <LISTE />
                
              }
            />
            <Route
              path="Raport"
              element={
                
                  <Raport />
                
              }
            />
            <Route
              path="/listeAffecte"
              element={
              
                  <ListeAffect />
               
              }
            />
            <Route
              path="/listeMaine"
              element={
              
                  <ListeMaine />
                
              }
            />
            <Route
              path="/user"
              element={
              
                  <User />
               
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
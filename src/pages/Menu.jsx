// Menu.jsx (ou Sidebar.jsx)
import React, { useState } from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  BiListUl, BiPlus, BiTransfer, BiArchive, BiChevronLeft, BiChevronRight, BiLogOut,BiUser,BiHome,BiCalendar,BiFolderOpen,BiMoneyWithdraw
} from 'react-icons/bi';

function Menu({ sidebarVisible, toggleSidebar, isMobile, userType }) { // Ajout userType
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mouvementOpen, setMouvementOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const toggleMouvement = () => setMouvementOpen(!mouvementOpen);
  const toggleArchive = () => setArchiveOpen(!archiveOpen);

  const handleToggleSidebar = () => {
    if (isMobile) {
      toggleSidebar();
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Menu restreint pour 'user' : seulement Accueil, Rapports (listes avec export), Déconnexion
  if (userType === 'User') {
    return (
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && !sidebarVisible ? 'hidden' : ''}`}>
        <div className="sidebar-nav-container">
          <Nav className="sidebar-nav flex-column mb-auto">
            <Nav.Link as={Link} to="/dash" className={`nav-item d-flex align-items-center text-white ${isActive('/dash')}`} onClick={isMobile ? toggleSidebar : undefined}>
              <BiListUl size={20} className="nav-icon" />
              {!collapsed && <span>Accueil</span>}
            </Nav.Link>
            <Nav.Link as={Link} to="#" className={`nav-item d-flex align-items-center text-white`} onClick={toggleArchive}>
              <BiArchive size={20} className="nav-icon" />
              {!collapsed && <span>Rapports</span>}
            </Nav.Link>
            {archiveOpen && !collapsed && (
              <div className="nav-dropdown">
                <Nav.Link as={Link} to="/liste" className={`nav-item dropdown-item text-white ${isActive('/liste')}`} onClick={isMobile ? toggleSidebar : undefined}>
                  Matériels
                </Nav.Link>
                <Nav.Link as={Link} to="/listeAffecte" className={`nav-item dropdown-item text-white ${isActive('/listeAffecte')}`} onClick={isMobile ? toggleSidebar : undefined}>
                  Affectation
                </Nav.Link>
                <Nav.Link as={Link} to="/listeMaine" className={`nav-item dropdown-item text-white ${isActive('/listeMaine')}`} onClick={isMobile ? toggleSidebar : undefined}>
                  Maintenance
                </Nav.Link>
              </div>
            )}
            <Nav.Link onClick={handleLogout} className={`nav-item d-flex align-items-center text-white`}>
              <BiLogOut size={20} className="nav-icon" />
              {!collapsed && <span>Déconnexion</span>}
            </Nav.Link>
          </Nav>
        </div>
      </div>
    );
  }


// Menu pour 'editor' : Accueil, Ajout (matériel), Rapports, Déconnexion
if (userType === 'editeur') {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && !sidebarVisible ? 'hidden' : ''}`}>
      <div className="sidebar-nav-container">
        <Nav className="sidebar-nav flex-column mb-auto">
          <Nav.Link as={Link} to="/dash" className={`nav-item d-flex align-items-center text-white ${isActive('/dash')}`} onClick={isMobile ? toggleSidebar : undefined}>
            <BiHome size={20} className="nav-icon" />
            {!collapsed && <span>Accueil</span>}
          </Nav.Link>
          <Nav.Link as={Link} to="/ajout" className={`nav-item d-flex align-items-center text-white ${isActive('/ajout')}`} onClick={isMobile ? toggleSidebar : undefined}>
            <BiPlus size={20} className="nav-icon" />
            {!collapsed && <span>Ajout Matériel</span>}
          </Nav.Link>
          <Nav.Link as={Link} to="#" className={`nav-item d-flex align-items-center text-white`} onClick={toggleArchive}>
            <BiArchive size={20} className="nav-icon" />
            {!collapsed && <span>Rapports</span>}
          </Nav.Link>
          {archiveOpen && !collapsed && (
            <div className="nav-dropdown">
              <Nav.Link as={Link} to="/liste" className={`nav-item dropdown-item text-white ${isActive('/liste')}`} onClick={isMobile ? toggleSidebar : undefined}>
                Matériels
              </Nav.Link>
              <Nav.Link as={Link} to="/listeAffecte" className={`nav-item dropdown-item text-white ${isActive('/listeAffecte')}`} onClick={isMobile ? toggleSidebar : undefined}>
                Affectation
              </Nav.Link>
              <Nav.Link as={Link} to="/listeMaine" className={`nav-item dropdown-item text-white ${isActive('/listeMaine')}`} onClick={isMobile ? toggleSidebar : undefined}>
                Maintenance
              </Nav.Link>
            </div>
          )}
          <Nav.Link onClick={handleLogout} className={`nav-item d-flex align-items-center text-white`}>
            <BiLogOut size={20} className="nav-icon" />
            {!collapsed && <span>Déconnexion</span>}
          </Nav.Link>
        </Nav>
      </div>
    </div>
  );
}

  // Menu complet pour 'admin'
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && !sidebarVisible ? 'hidden' : ''}`}>
      <div className="sidebar-nav-container">
        <Nav className="sidebar-nav flex-column mb-auto g-3">
          <Nav.Link as={Link} to="/dash" className={`nav-item d-flex align-items-center text-white g-8 ${isActive('/dash')}`} onClick={isMobile ? toggleSidebar : undefined}>
            <BiHome size={20} className="nav-icon" />
            {!collapsed && <span>Accueil</span>}
          </Nav.Link>
          <Nav.Link as={Link} to="/ajout" className={`nav-item d-flex align-items-center text-white g-3 ${isActive('/ajout')}`} onClick={isMobile ? toggleSidebar : undefined}>
            <BiFolderOpen size={20} className="nav-icon" />
            {!collapsed && <span>AFFAIRE</span>}
          </Nav.Link>
          <Nav.Link as={Link} to="/Equi" className={`nav-item d-flex align-items-center text-white g-3`} onClick={toggleMouvement}>
            <BiCalendar size={20} className="nav-icon" />
            {!collapsed && <span>RENDEZ-VOUS</span>}
          </Nav.Link>
        

          <Nav.Link as={Link} to="/creationMain" className={`nav-item d-flex align-items-center text-white`} >
            <BiMoneyWithdraw size={20} className="nav-icon" />
            {!collapsed && <span>PAIEMENT</span>}
          </Nav.Link>

          <Nav.Link as={Link} to="#" className={`nav-item d-flex align-items-center text-white`} onClick={toggleArchive}>
            <BiArchive size={20} className="nav-icon" />
            {!collapsed && <span>Rapports</span>}
          </Nav.Link>
          {archiveOpen && !collapsed && (
            <div className="nav-dropdown">
              <Nav.Link as={Link} to="/listeMaine" className={`nav-item dropdown-item text-white ${isActive('/liste')}`} onClick={isMobile ? toggleSidebar : undefined}>
                AFFAIRE
              </Nav.Link>
              <Nav.Link as={Link} to="/listeAffecte" className={`nav-item dropdown-item text-white ${isActive('/listeAffecte')}`} onClick={isMobile ? toggleSidebar : undefined}>
                Facture
              </Nav.Link>
              <Nav.Link as={Link} to="/Raport" className={`nav-item dropdown-item text-white ${isActive('/Raport')}`} onClick={isMobile ? toggleSidebar : undefined}>
                Rendez-Vous
              </Nav.Link>
            </div>
          )}


          <Nav.Link as={Link} to="/user" className={`nav-item d-flex align-items-center text-white g-3 ${isActive('/historique')}`} onClick={isMobile ? toggleSidebar : undefined}>
                <BiUser size={20} className="nav-icon" />
                {!collapsed && <span>Avocat</span>}
          </Nav.Link>

        </Nav>
      </div>
    </div>
  );
}

export default Menu;
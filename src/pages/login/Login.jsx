import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdWarning, MdInventory, MdBuild, MdError,MdLogin } from 'react-icons/md'
import './login.css';
const LoginPage = () => {
  const [nom_user, setNomUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', { nom_user, password });
      localStorage.setItem('token', response.data.token);
      setError('');
      navigate('/dash', { replace: true }); 
    } catch (err) {
      setError('Identifiants invalides');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <img src="../src/images/PdfImage.png" alt="Logo" className="login-logo" />
          <h1 className="login-title">Gestion du Materiel Informatique et Technique </h1>
        </div>
        <div className="login-right">
          <h2>Connectez-Vous</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="nom_user">Nom d'utilisateur</label>
              <input
                type="text"
                id="nom_user"
                value={nom_user}
                onChange={(e) => setNomUser(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button  className='btn btn-success mt-3  ' type="submit" style={{width:"100%"}}>Se connecter <MdLogin size={20} className='nav-icon text-white' /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
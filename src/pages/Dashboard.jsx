import React, { useEffect, useState } from "react";
import { Card, Button, Table, Row, Col, CardHeader, CardBody } from 'react-bootstrap';
import './dash.css'; // Assuming a similar CSS file exists or can be adapted
import axios from "axios";
import { MdWarning, MdInventory, MdBuild, MdError, MdAssignment, MdPeople, MdAttachMoney, MdEvent, MdTrendingUp } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'https://gestion-backend-6p1z.onrender.com';
function AffaireDashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    affairesEnCours: 0,
    affairesTerminees: 0,
    totalMontant: 0,
    rendezVousActuels: 0,
    nouveauxAffaires: 0,
  });
  const [listeAvocatsDisponibles, setListeAvocatsDisponibles] = useState([]);
  const [listeRendezVousActuels, setListeRendezVousActuels] = useState([]);
  const [error, setError] = useState(null);

  const showAlert = (message, type = 'warning') => {
    toast[type](
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <MdError size={20} style={{ marginRight: '8px', color: '#fff' }} />
        <span>{message}</span>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast-error',
      }
    );
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Assuming backend endpoints exist or need to be created. For now, using placeholders based on models.
        // You will need to implement these in your controller (e.g., affaireController.js)
        const [
          affairesEnCoursRes,
          affairesTermineesRes,
          totalMontantRes,
          rendezVousActuelsRes,
          nouveauxAffairesRes,
          avocatsDisponiblesRes,
          rendezVousListRes
        ] = await Promise.all([
          axios.get(`${API_URL}/affaires/en-cours-count`),
          axios.get(`${API_URL}/affaires/terminees-count`),
          axios.get(`${API_URL}/paiements/total-montant`),
          axios.get(`${API_URL}/rendezvous/count-actuels`),
          axios.get(`${API_URL}/affaires/nouveaux-count`),
          axios.get(`${API_URL}/avocats/disponibles`), // e.g., avocats not in rendez-vous today
          axios.get(`${API_URL}/rendezvous/actuels-liste`)
        ]);

        setStats({
          affairesEnCours: affairesEnCoursRes.data.count || 0,
          affairesTerminees: affairesTermineesRes.data.count || 0,
          totalMontant: totalMontantRes.data.total || 0,
          rendezVousActuels: rendezVousActuelsRes.data.count || 0,
          nouveauxAffaires: nouveauxAffairesRes.data.count || 0,
        });
        setListeAvocatsDisponibles(avocatsDisponiblesRes.data || []);
        setListeRendezVousActuels(rendezVousListRes.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Trigger alert if there are pending affaires or rendez-vous
  useEffect(() => {
    if (stats.affairesEnCours > 0) {
      showAlert(
        `Il y a ${stats.affairesEnCours} affaire${stats.affairesEnCours > 1 ? 's' : ''} en cours`,
        'warning'
      );
    }
  }, [stats.affairesEnCours]);

  if (loading) {
    return (
      <div className="container-fluid text-center mt-5">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <main className="container-fluid dashboard-container">
      <div className="dashboard-content">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        {error && <div className="alert alert-danger">{error}</div>}
        <Row className="g-4 mb-4">
  <Col xs={12} md={6} lg={2}> {/* Changé lg={3} à lg={2} pour 5 cartes */}
    <Card className="dashboard-card affaires-en-cours">
      <Card.Body>
        <Card.Title>
          <MdAssignment size={20} className="nav-icon text-primary me-2" />Affaires en Cours
        </Card.Title>
        <Card.Text className="dashboard-stat text-center">{stats.affairesEnCours}</Card.Text>
      </Card.Body>
    </Card>
  </Col>
  <Col xs={12} md={10} lg={2}>
    <Card className="dashboard-card affaires-terminees">
      <Card.Body>
        <Card.Title>
          <MdBuild size={20} className="nav-icon text-success me-2" />Affaires Terminées
        </Card.Title>
        <Card.Text className="dashboard-stat text-center">{stats.affairesTerminees}</Card.Text>
      </Card.Body>
    </Card>
  </Col>

  <Col xs={12} md={6} lg={2}>
    <Card className="dashboard-card nouveaux-affaires">
      <Card.Body>
        <Card.Title>
          <MdTrendingUp size={20} className="nav-icon text-secondary me-2" />Nouveaux Affaires
        </Card.Title>
        <Card.Text className="dashboard-stat text-center">{stats.nouveauxAffaires}</Card.Text>
      </Card.Body>
    </Card>
  </Col>
  <Col xs={12} md={6} lg={3}>
    <Card className="dashboard-card total-montant">
      <Card.Body>
        <Card.Title>
          <MdAttachMoney size={25} className="nav-icon text-info me-2" />Total Montant (AR)
        </Card.Title>
        <Card.Text className="dashboard-stat text-center">{stats.totalMontant.toLocaleString()}</Card.Text>
      </Card.Body>
    </Card>
  </Col>
  <Col xs={12} md={6} lg={3}>
    <Card className="dashboard-card rendez-vous-actuels">
      <Card.Body>
        <Card.Title>
          <MdEvent size={20} className="nav-icon text-warning me-2" />Rendez-vous Actuels
        </Card.Title>
        <Card.Text className="dashboard-stat text-center">{stats.rendezVousActuels}</Card.Text>
      </Card.Body>
    </Card>
  </Col>
</Row>
<Row className="g-4">
  <Col xs={12} lg={6}>
    <Card className="dashboard-card">
      <CardHeader className="avocats-disponibles">Liste des Avocats Disponibles pour Rendez-vous</CardHeader>
      <Card.Body>
        {listeAvocatsDisponibles.length > 0 ? (
          <Table striped bordered hover className="dashboard-table avocats-disponibles">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Spécialité</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {listeAvocatsDisponibles.map((avo) => (
                <tr key={avo.code_avo}>
                  <td>{avo.nom_avo}</td>
                  <td>{avo.prenom_avo}</td>
                  <td>{avo.specialite}</td>
                  <td>{avo.contact}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center">Aucun avocat disponible</div>
        )}
      </Card.Body>
    </Card>
  </Col>
  <Col xs={12} lg={6}>
    <Card className="dashboard-card">
      <CardHeader className="rendez-vous-actuels">Clients pour Rendez-vous Actuels</CardHeader>
      <Card.Body>
        {listeRendezVousActuels.length > 0 ? (
          <Table striped bordered hover className="dashboard-table rendez-vous-actuels">
            <thead>
              <tr>
                <th>Client</th>
                <th>Avocat</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Objectif</th>
              </tr>
            </thead>
            <tbody>
              {listeRendezVousActuels.map((rend) => (
                <tr key={rend.code_rend}>
                  <td>{rend.Client ? `${rend.Client.nom_cli} ${rend.Client.prenom_cli}` : 'N/A'}</td>
                  <td>{rend.Avocat ? `${rend.Avocat.nom_avo} ${rend.Avocat.prenom_avo}` : 'N/A'}</td>
                  <td>{new Date(rend.date_rend).toLocaleDateString()}</td>
                  <td>{rend.times}</td>
                  <td>{rend.objectif}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center">Aucun rendez-vous actuel</div>
        )}
      </Card.Body>
    </Card>
  </Col>
</Row>
      </div>
    </main>
  );
}

export default AffaireDashboard;
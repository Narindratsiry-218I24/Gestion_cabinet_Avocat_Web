import axios from 'axios';
import { Card, Button, Table, Form, Row, Col, Spinner, Modal, FormControl } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const API_URL = 'https://gestion-backend-6p1z.onrender.com';
function Mouvement() {
  const [donnees, setDonnees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [selectedMateriel, setSelectedMateriel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchClient, setSearchClient] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [selection, setSelection] = useState([]);
  const navigate = useNavigate();

  const [filtrer, setFilters] = useState({
    date_rend: '',
    times: '',
  });

  const [rendvous, setrendvous] = useState({
    date_rend: '',
    times: '',
    objectif: '',
    nom_cli: '',
    prenom_cli: '',
    adresse_cli: '',
    contact_cli: '',
    code_avo: '',
    code_cli: '',
  });

  const [showNewClientFields, setShowNewClientFields] = useState(false);

  // Charger les clients lors du montage du composant
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_URL}/clients`);
        if (response.data.length === 0) {
          showAlert('Aucun client disponible dans la base de données', 'warning');
        }
        setClients(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des clients:', err);
        showAlert('Erreur lors du chargement des clients', 'error');
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  // Filtrer les clients avec debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchClient) {
        const filtered = clients.filter((client) =>
          `${client.nom_cli} ${client.prenom_cli}`
            .toLowerCase()
            .includes(searchClient.toLowerCase())
        );
        setFilteredClients(filtered);
      } else {
        setFilteredClients([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchClient, clients]);

  // Gestion des filtres
  const filtration = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction de recherche des avocats disponibles
  const filtrage = async () => {
    if (!filtrer.date_rend || !filtrer.times) {
      showAlert('Veuillez sélectionner une date et une heure', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rendez`, {
        params: {
          date_rend: filtrer.date_rend,
          times: filtrer.times,
        },
      });
      console.log('Liste d\'avocats Disponibles', response.data);
      setDonnees(response.data);
      setShowTable(true);
    } catch (err) {
      console.error('Erreur lors du chargement des avocats:', err);
      showAlert('Erreur lors du chargement des avocats', 'error');
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des notifications
  const showAlert = (message, type = 'success') => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Gestion de la sélection d'un seul avocat
  const handleSelectMateriel = (materiel) => {
    setSelectedMateriel(materiel);
    setrendvous((prev) => ({
      ...prev,
      code_avo: materiel.code_avo,
    }));
  };

  // Gestion de l'ouverture du modal pour rendez-vous
  const handleAffecter = () => {
    if (!selectedMateriel) {
      showAlert('Veuillez sélectionner un avocat', 'error');
      return;
    }
    setShowModal(true);
    setrendvous((prev) => ({
      ...prev,
      date_rend: filtrer.date_rend,
      times: filtrer.times,
    }));
    setSearchClient('');
    setShowNewClientFields(false);
  };

  // Gestion de la soumission du modal
  const handleSubmitDestination = async () => {
    if (showNewClientFields && (!rendvous.nom_cli || !rendvous.prenom_cli)) {
      showAlert('Veuillez remplir le nom et prénom pour créer un nouveau client', 'warning');
      return;
    }

    if (!rendvous.objectif) {
      showAlert('Veuillez décrire l\'objectif du rendez-vous', 'warning');
      return;
    }

    try {
      const payload = {
        code_avo: selectedMateriel.code_avo,
        date_rend: filtrer.date_rend,
        times: filtrer.times,
        objectif: rendvous.objectif,
        nom_cli: rendvous.nom_cli,
        prenom_cli: rendvous.prenom_cli,
        adresse_cli: rendvous.adresse_cli || null,
        contact_cli: rendvous.contact_cli || null,
        code_cli: rendvous.code_cli || null,
      };

      await axios.post(`${API_URL}/rendez`, payload);
      showAlert(`Rendez-vous créé avec succès avec ${selectedMateriel.nom_avo} ${selectedMateriel.prenom_avo}`);
      
      setShowModal(false);
      setSelectedMateriel(null);
      setDonnees([]);
      setShowTable(false);
      setFilters({
        date_rend: '',
        times: '',
      });
      setrendvous({
        date_rend: '',
        times: '',
        objectif: '',
        nom_cli: '',
        prenom_cli: '',
        adresse_cli: '',
        contact_cli: '',
        code_avo: '',
        code_cli: '',
      });
    } catch (err) {
      console.error('Erreur lors de la création du rendez-vous:', err);
      showAlert(err.response?.data?.message || 'Erreur lors de la création du rendez-vous', 'error');
    }
  };

  // Gestion des changements dans le modal
  const handleDestinationChange = (e) => {
    const { name, value } = e.target;
    setrendvous((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion de la sélection d'un client existant
  const handleSelectClient = (client) => {
    setrendvous((prev) => ({
      ...prev,
      code_cli: client.code_cli,
      nom_cli: client.nom_cli,
      prenom_cli: client.prenom_cli,
      adresse_cli: client.adresse_cli || '',
      contact_cli: client.contact_cli || '',
    }));
    setSearchClient(`${client.nom_cli} ${client.prenom_cli}`);
    setShowNewClientFields(false);
    setFilteredClients([]);
  };

  // Gestion de la création d'un nouveau client
  const handleNewClient = () => {
    setrendvous((prev) => ({
      ...prev,
      code_cli: 'new',
      nom_cli: '',
      prenom_cli: '',
      adresse_cli: '',
      contact_cli: '',
    }));
    setSearchClient('');
    setShowNewClientFields(true);
    setFilteredClients([]);
  };

  return (
    <div className="container-fluid">
      <style>
        {`
          .custom-modal .modal-dialog {
            max-width: 100%;
            width: 2000px;
          }
          @media (max-width: 576px) {
            .custom-modal .modal-dialog {
              max-width: 100%;
              width: 100%;
              margin: 0;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .custom-modal .modal-content {
              height: auto;
              max-height: 90vh;
              overflow-y: auto;
              border-radius: 0;
            }
          }
          .client-search {
            position: relative;
          }
          .client-search-results {
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #ccc;
            max-height: 200px;
            overflow-y: auto;
            width: 100%;
          }
          .client-search-results div {
            padding: 8px;
            cursor: pointer;
          }
          .client-search-results div:hover {
            background: #f0f0f0;
          }
        `}
      </style>
      <ToastContainer />
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
              <h6 className="mb-3">Pour faire une demande de rendez-vous, veuillez remplir la date de rendez-vous</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 mb-3">
                <Col md={3}>
                  <Form.Label>Date de rendez-vous</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_rend"
                    value={filtrer.date_rend}
                    onChange={filtration}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Heure de rendez-vous</Form.Label>
                  <Form.Control
                    type="time"
                    name="times"
                    value={filtrer.times}
                    onChange={filtration}
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Label>Action</Form.Label>
                  <Form>
                    <Button
                      variant="primary"
                      onClick={filtrage}
                      disabled={loading}
                      style={{background:'#162caad5'}}
                    >
                        <FaSearch /> {loading ? <Spinner animation="border" size="sm" /> : 'Chercher'}
                    </Button>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showTable && donnees.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>Liste d'avocats disponibles à cette date et heure</Card.Header>
              <Card.Body className="table-responsive small" style={{ maxHeight: '500rem', overflowY: 'auto' }}>
                <Table striped bordered hover style={{ maxHeight: '500rem', overflowY: 'auto' }}>
                  <thead>
                    <tr>
                      <th scope="col">Sélectionner</th>
                      <th scope="col">Nom de l'avocat</th>
                      <th scope="col">Prénom de l'avocat</th>
                      <th scope="col">Adresse</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Spécialité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donnees.map((materiel) => (
                      <tr key={materiel.code_avo}>
                        <td>
                          <Form.Check
                            type="radio"
                            name="avocatSelection"
                            checked={selectedMateriel && selectedMateriel.code_avo === materiel.code_avo}
                            onChange={() => handleSelectMateriel(materiel)}
                          />
                        </td>
                        <td>{materiel.nom_avo}</td>
                        <td>{materiel.prenom_avo}</td>
                        <td>{materiel.adresse_avo}</td>
                        <td>{materiel.contact}</td>
                        <td>{materiel.specialite}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button variant="primary" onClick={handleAffecter}>
                  Prendre rendez-vous avec l'avocat sélectionné
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {showTable && donnees.length === 0 && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Body>Aucun avocat disponible pour ces critères.</Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="custom-modal" style={{ marginTop: '2rem' }}>
        <Modal.Header closeButton>
          <Modal.Title>
            Rendez-vous avec : {selectedMateriel?.nom_avo} {selectedMateriel?.prenom_avo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Client</Form.Label>
                <div className="client-search">
                  <FormControl
                    type="text"
                    placeholder="Tapez pour rechercher un client ou créer un nouveau..."
                    value={searchClient}
                    onChange={(e) => setSearchClient(e.target.value)}
                  />
                  {searchClient && (
                    <div className="client-search-results">
                      <div onClick={handleNewClient}>
                        + Créer un nouveau client
                      </div>
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <div
                            key={client.code_cli}
                            onClick={() => handleSelectClient(client)}
                          >
                            {client.nom_cli} {client.prenom_cli}
                          </div>
                        ))
                      ) : (
                        <div className="text-muted">Aucun client trouvé</div>
                      )}
                    </div>
                  )}
                </div>
              </Col>
              <Col md={6}>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="objectif"
                  value={rendvous.objectif}
                  onChange={handleDestinationChange}
                  placeholder="Décrivez l'objectif du rendez-vous"
                  required
                />
              </Col>

              {showNewClientFields && (
                <>
                  <Col md={6}>
                    <Form.Label>Nom du client</Form.Label>
                    <Form.Control
                      type="text"
                      name="nom_cli"
                      value={rendvous.nom_cli}
                      onChange={handleDestinationChange}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Prénom du client</Form.Label>
                    <Form.Control
                      type="text"
                      name="prenom_cli"
                      value={rendvous.prenom_cli}
                      onChange={handleDestinationChange}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Adresse du client</Form.Label>
                    <Form.Control
                      type="text"
                      name="adresse_cli"
                      value={rendvous.adresse_cli}
                      onChange={handleDestinationChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Contact du client</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact_cli"
                      value={rendvous.contact_cli}
                      onChange={handleDestinationChange}
                    />
                  </Col>
                </>
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmitDestination}>
            Confirmer le rendez-vous
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Mouvement;
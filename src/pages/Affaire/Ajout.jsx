import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Table, Form, Alert, Col, Row, Card, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { FaEdit , FaPlus, FaTrash } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';
import { FaSearch } from 'react-icons/fa';

const API_URL = 'https://gestion-backend-6p1z.onrender.com';
function Ajout() {
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type_aff: "", date_aff: "", statut: "", Montant: "", description: "",
    code_avo: null, code_cli: null, // IDs pour avocats/clients existants
    nom_cli: "", prenom_cli: "", adresse_cli: "", contact_cli: "",
    nom_avo: "", prenom_avo: "", num_im: "", specialite: "", contact: "", adresse_avo: ""
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [dataAffaire, setDataAffaire] = useState([]);
  const [filters, setFilters] = useState({ type_aff: '', date_aff: '', statut: '' });
  const [loading, setLoading] = useState(false);
  const [avocats, setAvocats] = useState([]);
  const [clients, setClients] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [affaireToDelete, setAffaireToDelete] = useState(null);
  const [avocatSearch, setAvocatSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showNewAvocatFields, setShowNewAvocatFields] = useState(false);
  const [showNewClientFields, setShowNewClientFields] = useState(false);
  const [filteredAvocats, setFilteredAvocats] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    fetchInitialData();
    fetchAvocats();
    fetchClients();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/affaire`);
      setDataAffaire(response.data);
    } catch (err) {
      console.error("Erreur:", err);
      showAlert('Erreur chargement affaires', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvocats = async (searchTerm = '') => {
    try {
      const response = await axios.get(`${API_URL}/avocat`, {
        params: { search: searchTerm }
      });
      setAvocats(response.data || []);
      setFilteredAvocats(response.data || []);
    } catch (err) {
      console.error("Erreur avocats:", err);
      showAlert('Erreur chargement avocats', 'error');
    }
  };

  const fetchClients = async (searchTerm = '') => {
    try {
      const response = await axios.get(`${API_URL}/clients`, {
        params: { search: searchTerm }
      });
      setClients(response.data || []);
      setFilteredClients(response.data || []);
    } catch (err) {
      console.error("Erreur clients:", err);
      showAlert('Erreur chargement clients', 'error');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWithFilters();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchWithFilters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/affaire`, { params: filters });
      setDataAffaire(response.data || []);
    } catch (err) {
      console.error("Erreur filtrage:", err);
      showAlert('Erreur filtrage', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let validatedValue = value;
    if (name === 'contact' || name === 'contact_cli' || name === 'num_im') {
      validatedValue = value.replace(/[^0-9\s\-\+]/g, '');
      if (value !== validatedValue) showAlert('Seuls chiffres, espaces, tirets et + autorisés', 'error');
    } else if (name === 'nom_avo' || name === 'prenom_avo' || name === 'nom_cli' || name === 'prenom_cli' || name === 'adresse_avo' || name === 'adresse_cli' || name === 'specialite' || name === 'type_aff') {
      validatedValue = value.replace(/[^a-zA-Z\s]/g, '');
      if (value !== validatedValue) showAlert('Seules lettres et espaces autorisés', 'error');
    } else if (name === 'Montant') {
      validatedValue = value.replace(/[^0-9.]/g, '');
      if (value !== validatedValue) showAlert('Seuls chiffres et point décimal autorisés', 'error');
    }

    setFormData(prev => ({ ...prev, [name]: validatedValue }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ type_aff: '', date_aff: '', statut: '' });
  };

  const handleSelectAvocat = (avocat) => {
    setFormData(prev => ({
      ...prev,
      code_avo: avocat.code_avo,
      nom_avo: avocat.nom_avo,
      prenom_avo: avocat.prenom_avo,
      num_im: avocat.num_im,
      specialite: avocat.specialite,
      contact: avocat.contact,
      adresse_avo: avocat.adresse_avo
    }));
    setShowNewAvocatFields(false);
    setAvocatSearch(`${avocat.nom_avo} ${avocat.prenom_avo}`);
    setFilteredAvocats([]);
  };

  const handleCreateAvocat = async () => {
    try {
      const { nom_avo, prenom_avo, num_im, specialite, contact, adresse_avo } = formData;
      if (!nom_avo || !prenom_avo || !num_im || !specialite || !contact || !adresse_avo) {
        showAlert('Tous les champs avocat sont requis', 'warning');
        return;
      }
      const response = await axios.post(`${API_URL}/avocat`, {
        nom_avo, prenom_avo, num_im, specialite, contact, adresse_avo
      });
      setFormData(prev => ({ ...prev, code_avo: response.data.avocat.code_avo }));
      showAlert('Avocat créé avec succès', 'success');
      fetchAvocats();
      setShowNewAvocatFields(false);
      setAvocatSearch(`${nom_avo} ${prenom_avo}`);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erreur création avocat', 'error');
    }
  };

  const handleNewAvocat = () => {
    setFormData(prev => ({
      ...prev,
      code_avo: null,
      nom_avo: '',
      prenom_avo: '',
      num_im: '',
      specialite: '',
      contact: '',
      adresse_avo: ''
    }));
    setAvocatSearch('');
    setShowNewAvocatFields(true);
    setFilteredAvocats([]);
  };

  const handleAvocatSearchChange = (e) => {
    const value = e.target.value;
    setAvocatSearch(value);
    if (value) {
      fetchAvocats(value);
    } else {
      setFilteredAvocats([]);
    }
  };

  const handleSelectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      code_cli: client.code_cli,
      nom_cli: client.nom_cli,
      prenom_cli: client.prenom_cli,
      adresse_cli: client.adresse_cli,
      contact_cli: client.contact_cli
    }));
    setShowNewClientFields(false);
    setClientSearch(`${client.nom_cli} ${client.prenom_cli}`);
    setFilteredClients([]);
  };

  const handleCreateClient = async () => {
    try {
      const { nom_cli, prenom_cli, adresse_cli, contact_cli } = formData;
      if (!nom_cli || !prenom_cli || !adresse_cli || !contact_cli) {
        showAlert('Tous les champs client sont requis', 'error');
        return;
      }
      const response = await axios.post(`${API_URL}/client`, {
        nom_cli, prenom_cli, adresse_cli, contact_cli
      });
      setFormData(prev => ({ ...prev, code_cli: response.data.client.code_cli }));
      showAlert('Client créé avec succès', 'success');
      fetchClients();
      setShowNewClientFields(false);
      setClientSearch(`${nom_cli} ${prenom_cli}`);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erreur création client', 'error');
    }
  };

  const handleNewClient = () => {
    setFormData(prev => ({
      ...prev,
      code_cli: null,
      nom_cli: '',
      prenom_cli: '',
      adresse_cli: '',
      contact_cli: ''
    }));
    setClientSearch('');
    setShowNewClientFields(true);
    setFilteredClients([]);
  };

  const handleClientSearchChange = (e) => {
    const value = e.target.value;
    setClientSearch(value);
    if (value) {
      fetchClients(value);
    } else {
      setFilteredClients([]);
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (currentStep === 1 && (!formData.type_aff || !formData.date_aff || !formData.statut || !formData.Montant)) {
      showAlert("Veuillez remplir tous les champs obligatoires", 'error');
      return;
    }
    if (currentStep === 2 && !formData.code_avo) {
      showAlert("Veuillez sélectionner ou créer un avocat", 'error');
      return;
    }
    if (currentStep === 3 && !formData.code_cli) {
      showAlert("Veuillez sélectionner ou créer un client", 'error');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(formData.Montant) <= 0) {
      showAlert("Montant doit être supérieur à 0", 'error');
      return;
    }
    try {
      setLoading(true);
      const dataToSend = {
        type_aff: formData.type_aff,
        date_aff: formData.date_aff,
        statut: formData.statut,
        Montant: parseFloat(formData.Montant),
        description: formData.description
      };
      if (formData.code_avo) {
        dataToSend.code_avo = formData.code_avo;
      } else {
        dataToSend.nom_avo = formData.nom_avo;
        dataToSend.prenom_avo = formData.prenom_avo;
        dataToSend.num_im = formData.num_im;
        dataToSend.specialite = formData.specialite;
        dataToSend.contact = formData.contact;
        dataToSend.adresse_avo = formData.adresse_avo;
      }
      if (formData.code_cli) {
        dataToSend.code_cli = formData.code_cli;
      } else {
        dataToSend.nom_cli = formData.nom_cli;
        dataToSend.prenom_cli = formData.prenom_cli;
        dataToSend.adresse_cli = formData.adresse_cli;
        dataToSend.contact_cli = formData.contact_cli;
      }
      const response = await axios.post(`${API_URL}/affaire`, dataToSend);
      showAlert('Affaire créée avec succès', 'success');
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
        setFormData({
          type_aff: "", date_aff: "", statut: "", Montant: "", description: "",
          code_avo: null, code_cli: null,
          nom_cli: "", prenom_cli: "", adresse_cli: "", contact_cli: "",
          nom_avo: "", prenom_avo: "", num_im: "", specialite: "", contact: "", adresse_avo: ""
        });
        setCurrentStep(1);
        fetchInitialData();
      }, 1500);
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(error.response?.data?.message || 'Erreur création affaire', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/affaire/${affaireToDelete.code_aff}`);
      showAlert('Affaire supprimée avec succès', 'success');
      setShowDeleteModal(false);
      fetchInitialData();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erreur suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (affaire) => {
    setAffaireToDelete(affaire);
    setShowDeleteModal(true);
  };

  return (
    <div className="container-fluid">
      <ToastContainer />
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Liste des Affaires</h6>
              <Button variant="outline-primary text-white" style={{background:'#162caad5'}} onClick={() => setShowModal(true)}>
                     <FaPlus />Crèer une nouvelle d'Affaire
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 mb-3">
                <Col md={3}>
                  <Form.Label>Type Affaire</Form.Label>
                  <Form.Control
                    name="type_aff"
                    placeholder="Type affaire"
                    value={filters.type_aff}
                    onChange={handleFilterChange}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Date Affaire</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_aff"
                    value={filters.date_aff}
                    onChange={handleFilterChange}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    name="statut"
                    value={filters.statut}
                    onChange={handleFilterChange}
                  >
                     <option value="">Selectionner Statut</option>
                                        <option value="en_cours">En cours</option>
                                        <option value="terminee">Terminée</option>
                                        <option value="annulee">Annulée</option>
                  </Form.Select>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button variant="secondary" style={{background:'#a5142d'}} onClick={resetFilters}>
                    Réinitialiser Filtres
                  </Button>
                </Col>
              </Row>
              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Montant</th>
                      <th>Description</th>
                      <th>Client</th>
                      <th>Avocat</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" className="text-center"><Spinner animation="border" /></td></tr>
                    ) : dataAffaire.length > 0 ? (
                      dataAffaire.map(aff => (
                        <tr key={aff.code_aff}>
                          <td>{aff.type_aff}</td>
                          <td>{new Date(aff.date_aff).toLocaleDateString()}</td>
                          <td>{aff.statut}</td>
                          <td>{aff.Montant}</td>
                          <td>{aff.description}</td>
                          <td>{aff.Client ? `${aff.Client.nom_cli} ${aff.Client.prenom_cli}` : ''}</td>
                          <td>{aff.Avocat ? `${aff.Avocat.nom_avo} ${aff.Avocat.prenom_avo}` : ''}</td>
                          <td>
                            <Button variant="outline-primary" size="sm" onClick={() => navigate(`/ajout/edit/${aff.code_aff}`)}>
                               <FaEdit />  
                            </Button>{' '}
                            <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(aff)}>
                              <FaTrash /> 
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="8" className="text-center text-muted">Aucune affaire trouvée</td></tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Création Affaire */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une nouvelle Affaire</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {submitSuccess ? (
              <Alert variant="success">Affaire ajoutée avec succès !</Alert>
            ) : (
              <>
                {currentStep === 1 && (
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Type Affaire</Form.Label>
                      <Form.Control
                        type="text"
                        name="type_aff"
                        value={formData.type_aff}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Date Affaire</Form.Label>
                      <Form.Control
                        type="date"
                        name="date_aff"
                        value={formData.date_aff}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Statut</Form.Label>
                      <Form.Select
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Sélectionner statut</option>
                        
                            <option value="en_cours">En cours</option>
                            <option value="terminee">Terminée</option>
                            <option value="annulee">Annulée</option>
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Montant (AR)</Form.Label>
                      <Form.Control
                        type="number"
                        name="Montant"
                        value={formData.Montant}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </Col>
                    <Col md={12}>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>
                )}
                {currentStep === 2 && (
                  <Row className="g-3">
                    <Col md={12}>
                      <h6>Avocat</h6>
                      <Form.Group className="mb-3 position-relative">
                        <Form.Label>Rechercher un avocat</Form.Label>
                        <div className="d-flex">
                          <Form.Control
                            type="text"
                            placeholder="Nom, prénom ou numéro d'immatriculation"
                            value={avocatSearch}
                            onChange={handleAvocatSearchChange}
                          />
                          <Button variant="outline-primary" className="ms-2">
                            <FaSearch />
                          </Button>
                        </div>
                        {avocatSearch && filteredAvocats.length >= 0 && (
                          <div style={{
                            position: 'absolute',
                            zIndex: 1000,
                            background: 'white',
                            border: '1px solid #ccc',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            width: '100%'
                          }}>
                            <div 
                              style={{ padding: '8px', cursor: 'pointer' }} 
                              onClick={handleNewAvocat}
                              onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                              onMouseOut={(e) => e.target.style.background = 'white'}
                            >
                              + Créer un nouvel avocat
                            </div>
                            {filteredAvocats.map((av) => (
                              <div 
                                key={av.code_avo}
                                style={{ padding: '8px', cursor: 'pointer' }} 
                                onClick={() => handleSelectAvocat(av)}
                                onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                              >
                                {av.nom_avo} {av.prenom_avo} ({av.num_im})
                              </div>
                            ))}
                          </div>
                        )}
                      </Form.Group>
                      {formData.code_avo && !showNewAvocatFields && (
                        <Alert variant="info" className="mt-2">
                          Avocat sélectionné: {formData.nom_avo} {formData.prenom_avo}
                        </Alert>
                      )}
                      {showNewAvocatFields && (
                        <>
                          <h6 className="mt-4">Créer un nouvel avocat</h6>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Label>Nom</Form.Label>
                              <Form.Control
                                type="text"
                                name="nom_avo"
                                value={formData.nom_avo}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>Prénom</Form.Label>
                              <Form.Control
                                type="text"
                                name="prenom_avo"
                                value={formData.prenom_avo}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>Num Immatriculation</Form.Label>
                              <Form.Control
                                type="text"
                                name="num_im"
                                value={formData.num_im}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>Spécialité</Form.Label>
                              <Form.Control
                                type="text"
                                name="specialite"
                                value={formData.specialite}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>Contact</Form.Label>
                              <Form.Control
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>Adresse</Form.Label>
                              <Form.Control
                                type="text"
                                name="adresse_avo"
                                value={formData.adresse_avo}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={12}>
                              <Button variant="success" onClick={handleCreateAvocat} disabled={loading}>
                                {loading ? 'En cours...' : 'Créer Avocat'}
                              </Button>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Col>
                  </Row>
                )}
                {currentStep === 3 && (
                  <Row className="g-3">
                    <Col md={12}>
                      <h6>Client</h6>
                      <Form.Group className="mb-3 position-relative">
                        <Form.Label>Rechercher un client</Form.Label>
                        <div className="d-flex">
                          <Form.Control
                            type="text"
                            placeholder="Nom ou prénom"
                            value={clientSearch}
                            onChange={handleClientSearchChange}
                          />
                          <Button variant="outline-primary" className="ms-2">
                            <FaSearch />
                          </Button>
                        </div>
                        {clientSearch && filteredClients.length >= 0 && (
                          <div style={{
                            position: 'absolute',
                            zIndex: 1000,
                            background: 'white',
                            border: '1px solid #ccc',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            width: '100%'
                          }}>
                            <div 
                              style={{ padding: '8px', cursor: 'pointer' }} 
                              onClick={handleNewClient}
                              onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                              onMouseOut={(e) => e.target.style.background = 'white'}
                            >
                              + Créer un nouveau client
                            </div>
                            {filteredClients.map((cl) => (
                              <div 
                                key={cl.code_cli}
                                style={{ padding: '8px', cursor: 'pointer' }} 
                                onClick={() => handleSelectClient(cl)}
                                onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                              >
                                {cl.nom_cli} {cl.prenom_cli}
                              </div>
                            ))}
                          </div>
                        )}
                      </Form.Group>
                      {formData.code_cli && !showNewClientFields && (
                        <Alert variant="info" className="mt-2">
                          Client sélectionné: {formData.nom_cli} {formData.prenom_cli}
                        </Alert>
                      )}
                      {showNewClientFields && (
                        <>
                          <h6 className="mt-4">Créer un nouveau client</h6>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Label>Nom</Form.Label>
                              <Form.Control
                                type="text"
                                name="nom_cli"
                                value={formData.nom_cli}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>Prénom</Form.Label>
                              <Form.Control
                                type="text"
                                name="prenom_cli"
                                value={formData.prenom_cli}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>Adresse</Form.Label>
                              <Form.Control
                                type="text"
                                name="adresse_cli"
                                value={formData.adresse_cli}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>Contact</Form.Label>
                              <Form.Control
                                type="text"
                                name="contact_cli"
                                value={formData.contact_cli}
                                onChange={handleChange}
                                required
                              />
                            </Col>
                            <Col md={12}>
                              <Button variant="success" onClick={handleCreateClient} disabled={loading}>
                                {loading ? 'En cours...' : 'Créer Client'}
                              </Button>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Col>
                  </Row>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                if (currentStep === 1) setShowModal(false);
                else prevStep();
              }}
              disabled={loading}
              style={{background:"#a5142d"}}
            >
              {currentStep === 1 ? 'Annuler' : 'Précédent'}
            </Button>
            {!submitSuccess && (
              currentStep < 3 ? (
                <Button variant="primary" style={{background:'#162caad5'}} onClick={nextStep} disabled={loading}>
                  Suivant
                </Button>
              ) : (
                <Button variant="success" type="submit" disabled={loading}>
                  {loading ? 'En cours...' : 'Enregistrer'}
                </Button>
              )
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Confirmation Suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation Suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer cette affaire ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'En cours...' : 'Supprimer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Ajout;
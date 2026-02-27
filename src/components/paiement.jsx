import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function PaiementCreate() {
    const [loading, setLoading] = useState(false);
    const [loadingAffaires, setLoadingAffaires] = useState(false);
    const [affaires, setAffaires] = useState([]);
    const [filtersAffaires, setFiltersAffaires] = useState({
        search: '',
        date_aff: '',
        statut: '',
        type_aff: '',
        nom_cli: '',
        prenom_cli: ''
    });
    const [formData, setFormData] = useState({
        code_aff: '',
        code_cli: '',
        date_pay: new Date().toISOString().split('T')[0],
        cout: ''
    });
    const [selectedAffaire, setSelectedAffaire] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAffaires();
    }, [filtersAffaires]);

    const fetchAffaires = async () => {
        try {
            setLoadingAffaires(true);
            const response = await axios.get('http://localhost:3000/paiement/affaires', {
                params: {
                    ...filtersAffaires,
                    date_aff: filtersAffaires.date_aff || undefined,
                    statut: filtersAffaires.statut || undefined,
                    type_aff: filtersAffaires.type_aff || undefined,
                    nom_cli: filtersAffaires.nom_cli || undefined,
                    prenom_cli: filtersAffaires.prenom_cli || undefined
                }
            });
            setAffaires(response.data.data || response.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des affaires:", err);
            showAlert('Erreur lors du chargement des affaires', 'error');
            setAffaires([]);
        } finally {
            setLoadingAffaires(false);
        }
    };

    const showAlert = (message, type = 'success') => {
        toast[type](message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    const handleFilterAffairesChange = (e) => {
        const { name, value } = e.target;
        setFiltersAffaires(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectAffaire = (affaire) => {
        setFormData({ 
            ...formData, 
            code_aff: affaire.code_aff, 
            code_cli: affaire.Client ? affaire.Client.code_cli : affaire.code_cli 
        });
        setSelectedAffaire(affaire);
    };

    const handleOpenCreateModal = () => {
        if (!formData.code_aff) {
            showAlert("Veuillez sélectionner une affaire avant de créer un paiement", 'warning');
            return;
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.cout || parseFloat(formData.cout) <= 0) {
            showAlert("Veuillez remplir un coût valide", 'warning');
            return;
        }
        try {
            setLoading(true);
            const paiementData = { ...formData };
            await axios.post('http://localhost:3000/paiement', paiementData);
            showAlert('Paiement créé avec succès', 'success');
            setShowModal(false);
            setFormData({
                code_aff: '',
                code_cli: '',
                date_pay: new Date().toISOString().split('T')[0],
                cout: ''
            });
            setSelectedAffaire(null);
            navigate('/creationMain');
        } catch (error) {
            console.error("Erreur:", error);
            showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <ToastContainer />
            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                            <h6 className="mb-0">Rechercher les affaires</h6>
                            <Button variant="primary" style={{background:'#162caad5'}} onClick={handleOpenCreateModal} disabled={!selectedAffaire}>
                                Créer un nouveau paiement
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3 mb-3">
                                <Col md={3}>
                                    <Form.Label>Date de l'affaire</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="date_aff"
                                        value={filtersAffaires.date_aff}
                                        onChange={handleFilterAffairesChange}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Statut</Form.Label>
                                    <Form.Select
                                        name="statut"
                                        value={filtersAffaires.statut}
                                        onChange={handleFilterAffairesChange}
                                    >
                                        <option value="">Tous les statuts</option>
                                        <option value="en_cours">En cours</option>
                                        <option value="terminee">Terminée</option>
                                        <option value="annulee">Annulée</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Type d'affaire</Form.Label>
                                    <Form.Control
                                        type='text'
                                        name="type_aff"
                                        value={filtersAffaires.type_aff}
                                        onChange={handleFilterAffairesChange}
                                    >
                                        
                                    </Form.Control>
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Nom du client</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nom_cli"
                                        placeholder="Nom du client"
                                        value={filtersAffaires.nom_cli}
                                        onChange={handleFilterAffairesChange}
                                    />
                                </Col>
                            </Row>
                            <div className="table-responsive small" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <Table className='table table-striped table-sm' size="sm">
                                    <thead>
                                        <tr>
                                            <th scope="col">Sélection</th>
                                            <th scope="col">Type Affaire</th>
                                            <th scope="col">Client</th>
                                            <th scope="col">Date Affaire</th>
                                            <th scope="col">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingAffaires ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    <Spinner animation="border" size="sm" />
                                                </td>
                                            </tr>
                                        ) : affaires.length > 0 ? (
                                            affaires.map(affaire => (
                                                <tr key={affaire.code_aff}>
                                                    <td>
                                                        <Form.Check
                                                            type="radio"
                                                            name="selectedAffaire"
                                                            checked={formData.code_aff === affaire.code_aff}
                                                            onChange={() => handleSelectAffaire(affaire)}
                                                        />
                                                    </td>
                                                    <td>{affaire.type_aff}</td>
                                                    <td>
                                                        {affaire.Client ? 
                                                            `${affaire.Client.nom_cli} ${affaire.Client.prenom_cli}` : 
                                                            'Client non spécifié'
                                                        }
                                                    </td>
                                                    <td>{affaire.date_aff ? new Date(affaire.date_aff).toLocaleDateString() : 'N/A'}</td>
                                                    <td>{affaire.statut || 'N/A'}</td>
                                                  
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">
                                                    Aucune affaire trouvée
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} size="md" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Nouveau paiement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Card className="mb-3">
                            <Card.Header className="bg-light">
                                <h6 className="mb-0">Affaire sélectionnée</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <strong>Affaire:</strong> {selectedAffaire?.type_aff}
                                    </Col>
                                    <Col md={6}>
                                        <strong>Client:</strong> {selectedAffaire?.Client ? `${selectedAffaire.Client.nom_cli} ${selectedAffaire.Client.prenom_cli}` : 'N/A'}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Header className="bg-light">
                                <h6 className="mb-0">Détails du paiement</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Date du paiement (facture)</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="date_pay"
                                                value={formData.date_pay}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Montan  (en AR)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="cout"
                                                value={formData.cout}
                                                onChange={handleChange}
                                                placeholder="Montant en Ar"
                                                step="0.01"
                                                min="0"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div className="d-flex justify-content-end gap-3 mt-3">
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Annuler
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        En cours...
                                    </>
                                ) : (
                                    'Créer le paiement'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

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
        </div>
    );
}

export default PaiementCreate;
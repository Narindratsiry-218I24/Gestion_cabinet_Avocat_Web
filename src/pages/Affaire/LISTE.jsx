import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'https://gestion-backend-6p1z.onrender.com';
function ListeRendezVous() {
    
    const [rendezVous, setRendezVous] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [filters, setFilters] = useState({
        date_rend: '',
        times: '',
        nom_cli: '',
        prenom_cli: ''
    });

    const fetchRendezVous = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/rendez-vous`, {
                params: { ...filters }
            });
            setRendezVous(response.data.data || []);
            setShowTable(true);
        } catch (err) {
            console.error("Erreur lors de la récupération des rendez-vous:", err);
            showAlert('Erreur lors du chargement des rendez-vous', 'error');
            setShowTable(false);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            date_rend: '',
            times: '',
            nom_cli: '',
            prenom_cli: ''
        });
        setShowTable(false);
        setRendezVous([]);
    };

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

    return (
        <div className="container-fluid mt-4">
            <ToastContainer />
            <Card className="mb-4">
                <Card.Header className="bg-light">
                    <h6 className="mb-0">Filtrer les Rendez-vous</h6>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3 mb-3">
                        <Col md={3}>
                            <Form.Label>Date Rendez-vous</Form.Label>
                            <Form.Control
                                type="date"
                                name="date_rend"
                                value={filters.date_rend}
                                onChange={handleFilterChange}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Label>Heure</Form.Label>
                            <Form.Control
                                type="time"
                                name="times"
                                value={filters.times}
                                onChange={handleFilterChange}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Label>Nom Client</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom_cli"
                                placeholder="Nom du client"
                                value={filters.nom_cli}
                                onChange={handleFilterChange}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Label>Prénom Client</Form.Label>
                            <Form.Control
                                type="text"
                                name="prenom_cli"
                                placeholder="Prénom du client"
                                value={filters.prenom_cli}
                                onChange={handleFilterChange}
                            />
                        </Col>
                    </Row>
                    <Row className="g-3">
                        <Col md={2}>
                            <Button
                                variant="secondary"
                                onClick={resetFilters}
                                disabled={!filters.date_rend && !filters.times && !filters.nom_cli && !filters.prenom_cli}
                            >
                                Réinitialiser
                            </Button>
                        </Col>
                        <Col md={2}>
                            <Button
                                variant="primary"
                                onClick={fetchRendezVous}
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Chercher'}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                    <p>Chargement des rendez-vous...</p>
                </div>
            ) : showTable && rendezVous.length > 0 ? (
                <Card>
                    <Card.Header>
                        <h4>Liste des Rendez-vous</h4>
                    </Card.Header>
                    <Card.Body>
                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Heure</th>
                                        <th>Objectif</th>
                                        <th>Client</th>
                                        <th>Avocat</th>
                                        <th>Contact Client</th>
                                        <th>Contact Avocat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rendezVous.map((rdv) => (
                                        <tr key={rdv.code_rdv}>
                                            <td>{new Date(rdv.date_rend).toLocaleDateString()}</td>
                                            <td>{rdv.times}</td>
                                            <td>{rdv.objectif}</td>
                                            <td>{rdv.Client ? `${rdv.Client.nom_cli} ${rdv.Client.prenom_cli}` : '-'}</td>
                                            <td>{rdv.Avocat ? `${rdv.Avocat.nom_avo} ${rdv.Avocat.prenom_avo}` : '-'}</td>
                                            <td>{rdv.Client?.contact_cli || '-'}</td>
                                            <td>{rdv.Avocat?.contact || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            ) : showTable && rendezVous.length === 0 ? (
                <Card>
                    <Card.Body>Aucun rendez-vous trouvé pour ces critères.</Card.Body>
                </Card>
            ) : null}
        </div>
    );
}

export default ListeRendezVous;
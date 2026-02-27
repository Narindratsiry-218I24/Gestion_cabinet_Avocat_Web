import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, Modal, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function MaintenanceList() {
    const [loading, setLoading] = useState(false);
    const [loadingMaintenances, setLoadingMaintenances] = useState(false);
    const [loadingTechniciens, setLoadingTechniciens] = useState(false);
    const [maintenances, setMaintenances] = useState([]);
    const [techniciens, setTechniciens] = useState([]);
    const [filtersMaintenances, setFiltersMaintenances] = useState({
        search: '',
        type_main: '',
        statut: ''
    });
    const [formData, setFormData] = useState({
        id_main: '',
        code_mat: '',
        type_main: 'preventive',
        description: '',
        date_main: new Date().toISOString().split('T')[0],
        statut: 'en_cours',
        code_techn: ''
    });
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                await Promise.all([fetchMaintenances(), fetchTechniciens()]);
            } catch (err) {
                console.error("Erreur lors du chargement initial:", err);
                showAlert('Erreur lors du chargement initial', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchMaintenances();
    }, [filtersMaintenances]);

    const fetchMaintenances = async () => {
        try {
            setLoadingMaintenances(true);
            const response = await axios.get('http://localhost:3000/maintenance/maintenances', {
                params: { ...filtersMaintenances }
            });
            setMaintenances(response.data.data || response.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des maintenances:", err);
            showAlert('Erreur lors du chargement des maintenances', 'error');
            setMaintenances([]);
        } finally {
            setLoadingMaintenances(false);
        }
    };

    const fetchTechniciens = async () => {
        try {
            setLoadingTechniciens(true);
            const response = await axios.get('http://localhost:3000/technicien');
            setTechniciens(response.data.data || response.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des techniciens:", err);
            showAlert('Erreur lors du chargement des techniciens', 'error');
            setTechniciens([]);
        } finally {
            setLoadingTechniciens(false);
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

    const handleFilterMaintenancesChange = (e) => {
        const { name, value } = e.target;
        setFiltersMaintenances(prev => ({ ...prev, [name]: value }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenEditModal = (maintenance) => {
        setFormData({
            id_main: maintenance.id_main,
            code_mat: maintenance.code_mat,
            type_main: maintenance.type_main,
            description: maintenance.description,
            date_main: new Date(maintenance.date_main).toISOString().split('T')[0],
            statut: maintenance.statut,
            code_techn: maintenance.code_techn || ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code_mat || !formData.description) {
            showAlert("Veuillez sélectionner un matériel et remplir la description", 'warning');
            return;
        }
        try {
            setLoading(true);
            const maintenanceData = { ...formData, code_techn: formData.code_techn || null };
            await axios.put(`http://localhost:3000/maintenance/maintenances/${formData.id_main}`, maintenanceData);
            showAlert('Maintenance mise à jour avec succès', 'success');

            if (formData.statut === 'terminee') {
                await axios.put(`http://localhost:3000/maintenance/materiels/${formData.code_mat}/etat`, { etat: 'en service' });
            }

            await fetchMaintenances();
            setShowModal(false);
        } catch (error) {
            console.error("Erreur:", error);
            showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (statut) => {
        switch (statut) {
            case 'en_cours': return <Badge bg="dark">En cours</Badge>;
            case 'terminee': return <Badge bg="success">Terminée</Badge>;
            case 'annulee': return <Badge bg="danger">Annulée</Badge>;
            default: return <Badge bg="secondary">{statut}</Badge>;
        }
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'preventive': return <Badge bg="info">Préventive</Badge>;
            case 'corrective': return <Badge bg="danger">Corrective</Badge>;
            case 'amelioration': return <Badge bg="primary">Amélioration</Badge>;
            default: return <Badge bg="secondary">{type}</Badge>;
        }
    };

    return (
        <div className="container-fluid">
            <ToastContainer />
            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                            <Button variant="success" onClick={() => navigate('/creationMain')}>
                                Nouvelle maintenance
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3 mb-3">
                                <Col md={4}>
                                    <Form.Label>Rechercher</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="search"
                                        placeholder="Matériel, technicien, description"
                                        value={filtersMaintenances.search}
                                        onChange={handleFilterMaintenancesChange}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Type de maintenance</Form.Label>
                                    <Form.Select
                                        name="type_main"
                                        value={filtersMaintenances.type_main}
                                        onChange={handleFilterMaintenancesChange}
                                    >
                                        <option value="">Tous les types</option>
                                        <option value="preventive">Préventive</option>
                                        <option value="corrective">Corrective</option>
                                        <option value="amelioration">Amélioration</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Statut</Form.Label>
                                    <Form.Select
                                        name="statut"
                                        value={filtersMaintenances.statut}
                                        onChange={handleFilterMaintenancesChange}
                                    >
                                        <option value="">Tous les statuts</option>
                                        <option value="en_cours">En cours</option>
                                        <option value="terminee">Terminée</option>
                                        <option value="annulee">Annulée</option>
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setFiltersMaintenances({ search: '', type_main: '', statut: '' })}
                                    >
                                        Réinitialiser
                                    </Button>
                                </Col>
                            </Row>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Matériel</th>
                                            <th>N° Série</th>
                                            <th>Type</th>
                                            <th>Description</th>
                                            <th>Technicien</th>
                                            <th>Date</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingMaintenances ? (
                                            <tr>
                                                <td colSpan="8" className="text-center">
                                                    <Spinner animation="border" />
                                                </td>
                                            </tr>
                                        ) : maintenances.length > 0 ? (
                                            maintenances.map(maintenance => (
                                                <tr key={maintenance.id_main}>
                                                    <td>{maintenance.nom_materiel}</td>
                                                    <td>{maintenance.numero_serie}</td>
                                                    <td>{maintenance.type_main}</td>
                                                    <td>{maintenance.description}</td>
                                                    <td>{maintenance.nom_tech || 'Pas Tehcnicien'}</td>
                                                    <td>{new Date(maintenance.date_main).toLocaleDateString()}</td>
                                                    <td>{getStatusBadge(maintenance.statut)}</td>
                                                    <td>
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => handleOpenEditModal(maintenance)}
                                                        >
                                                            Modifier
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted">
                                                    Aucune maintenance trouvée
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

            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Modifier maintenance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Card className="mb-3">
                            <Card.Header className="bg-light">
                                <h6 className="mb-0">Détails de la maintenance</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Type de maintenance</Form.Label>
                                            <Form.Select
                                                name="type_main"
                                                value={formData.type_main}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="preventive">Préventive</option>
                                                <option value="corrective">Corrective</option>
                                                <option value="amelioration">Amélioration</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Statut</Form.Label>
                                            <Form.Select
                                                name="statut"
                                                value={formData.statut}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="en_cours">En cours</option>
                                                <option value="terminee">Terminée</option>
                                                <option value="annulee">Annulée</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="date_main"
                                                value={formData.date_main}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Technicien</Form.Label>
                                            <Form.Select
                                                name="code_techn"
                                                value={formData.code_techn}
                                                onChange={handleChange}
                                                disabled={loadingTechniciens}
                                            >
                                                <option value="">Sélectionner un technicien</option>
                                                {techniciens.map(tech => (
                                                    <option key={tech.code_techn} value={tech.code_techn}>
                                                        {tech.nom_techn} {tech.prenom_techn}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Décrivez la maintenance à effectuer"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div className="d-flex justify-content-end gap-3">
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
                                    'Mettre à jour'
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

export default MaintenanceList;
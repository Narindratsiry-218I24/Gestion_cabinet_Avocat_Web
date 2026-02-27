import { useState, useEffect } from "react";
import axios from 'axios';
import { Card, Button, Table, Form, Row, Col, Spinner, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';



const API_URL = 'https://gestion-backend-6p1z.onrender.com';
function Affectation() {
    // États pour le chargement
    const [loading, setLoading] = useState(false);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const navigate = useNavigate();
    // États pour les données
    const [departements, setDepartements] = useState([]);
    const [materiels, setMateriels] = useState([]);
    const [historique, setHistorique] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    // État pour contrôler l'affichage du tableau
    const [showMaterialsTable, setShowMaterialsTable] = useState(false);


    const handleClick = () => {
        // Navigation avec paramètres
        navigate('/Equi', { state: { from: 'Mouvement' } });
      };


    // États pour les filtres
    const [filters, setFilters] = useState({
        type_depart: '',
        adresse: '',
        search: '',
        nom_dete: '',
        attribue_only: false
    });

    // États pour le formulaire
    const [formData, setFormData] = useState({
        code_mat: '',
        ville: '',
        adresse_empl: '',
        nom_depart: '',
        nom_dir: '',
        num_porte :'',
        distrinct: '',
        Region: '',
        type_dir: ''
    });

   
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

 
    const API_BASE_URL = 'https://gestion-avocat-backend.onrender.com';

    // Chargement initial des données
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const departementsRes = await axios.get(`${API_BASE_URL}/departements`);
                const categorieRs = await axios.get(`${API_BASE_URL}/categories`)
                setDepartements(departementsRes.data.data || departementsRes.data);
                await fetchHistorique();
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                showAlert('Erreur lors du chargement des données', 'error');
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Charger les matériels avec filtres
    const fetchMateriels = async () => {
        try {
            setLoadingMaterials(true);
            const response = await axios.get(`${API_BASE_URL}/materiels`, {
                params: {
                    ...filters,
                    attribue_only: filters.attribue_only ? 'true' : undefined
                }
            });
            console.log("Données des matériels:", response.data);
            setMateriels(response.data);
            setShowMaterialsTable(true); // Afficher le tableau après la recherche
        } catch (err) {
            console.error("Erreur lors du chargement des matériels:", err);
            showAlert('Erreur lors du chargement des matériels', 'error');
            setShowMaterialsTable(false); 
        } finally {
            setLoadingMaterials(false);
        }
    };

    // Charger l'historique
    const fetchHistorique = async () => {
        try {
            setLoadingHistory(true);
            const response = await axios.get(`${API_BASE_URL}/historique`);
            setHistorique(response.data.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement de l'historique:", err);
            showAlert("Erreur lors du chargement de l'historique", 'error');
        } finally {
            setLoadingHistory(false);
        }
    };
    console.log (historique) ;

    // Gestion des notifications
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

    // Gestion des changements de filtres
    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Gestion des changements de formulaire
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Sélection d'un matériel
    const handleSelectMaterial = (materiel) => {
        setFormData(prev => ({
            ...prev,
            code_mat: materiel.code_mat
        }));
        setSelectedMaterial(materiel);
        setCurrentStep(2);
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code_mat || !formData.nom_depart) {
            showAlert("Veuillez sélectionner un matériel et un département de destination", 'warning');
            return;
        }

        try {
            setLoading(true);

            const affectationData = {
                code_mat: formData.code_mat,
                ville: formData.ville,
                adresse_empl: formData.adresse_empl,
                nom_depart: formData.nom_depart,
                nom_dir: formData.nom_dir || null,
                distrinct: formData.distrinct || null,
                Region: formData.Region || null,
                type_dir: formData.type_dir || null
            };

            const response = await axios.post(`${API_BASE_URL}/historique`, affectationData);

            if (response.data.message.includes("succès")) {
                showAlert('Affectation enregistrée avec succès', 'success');
                await Promise.all([fetchHistorique(), fetchMateriels()]);
                resetForm();
                setShowModal(false);
                setCurrentStep(1);
            }
        } catch (error) {
            console.error("Erreur:", error);
            showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
        } finally {
            setLoading(false);
        }
    };

    // Réinitialisation du formulaire
    const resetForm = () => {
        setFormData({
            code_mat: '',
            ville: '',
            adresse_empl: '',
            nom_depart: '',
            nom_dir: '',
            distrinct: '',
            Region: '',
            type_dir: ''
        });
        setFilters({
            type_depart: '',
            adresse: '',
            search: '',
            nom_dete: '',
            attribue_only: false
        });
        setSelectedMaterial(null);
        setShowMaterialsTable(false); // Cacher le tableau lors de la réinitialisation
    };

    // Vérifier si le département de destination est DST
    const isDestinationDST = departements.find(
        d => d.nom_depart === formData.nom_depart
    )?.type_depart === "DST";

    // Gestion de l'ouverture de la modal
    const handleOpenModal = () => {
        setShowModal(true);
        setCurrentStep(1);
        resetForm(); // Réinitialiser les filtres et le formulaire à l'ouverture
    };

    // Gestion de la fermeture de la modal
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
        setCurrentStep(1);
    };

    // Gestion de l'étape suivante
    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    // Gestion de l'étape précédente
    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="container ">
            <div className="row">
                <div className="col-md-2">
        
                </div>

                <div className="col-md-10">
                    <Card className="mb-4 mt-3">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                            <h5 className="mb-0"></h5>
                            <Button variant="success" onClick={handleClick}>
                                Nouvelle affectation
                            </Button>
                        </Card.Header>
                    </Card>

                    <Card >
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                            <h5 className="mb-0">Liste de dernier Affectation</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive small" >
                                <Table table table-striped table-sm >
                                    <thead>
                                        <tr scope="col">
                                            <th scope="col">Matériel</th>
                                            <th scope="col">N° Série</th>
                                            <th scope="col">Source</th>
                                            <th scope="col">Destination</th>
                                            <th scope="col">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingHistory ? (
                                            <tr>
                                                <td colSpan="5" className="text-center">
                                                    <Spinner animation="border" />
                                                </td>
                                            </tr>
                                        ) : historique.length > 0 ? (
                                            historique.map(hist => (
                                                <tr key={hist.id_hist}>
                                                    <td>{hist.materiel?.nom || 'Non spécifié'}</td>
                                                    <td>{hist.materiel?.numero_serie || 'Non spécifié'}</td>
                                                    <td>
                                                        <div>
                                                            <strong>Ville:</strong> {hist.emplacement_source?.ville || 'Non spécifié'}
                                                        </div>
                                                        <div className="text-muted small">
                                                            <strong>Adresse:</strong> {hist.emplacement_source?.adresse_empl || 'Non spécifié'}
                                                            {hist.emplacement_source?.departement?.type_depart === 'DST' && hist.emplacement_source?.direction?.length > 0 && (
                                                                <div>
                                                                    <strong>Direction:</strong> {hist.emplacement_source?.direction[0].nom_dir} ({hist.emplacement_source?.direction[0]?.type_dir})
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>Ville:</strong> {hist.emplacement_destination?.ville || 'Non spécifié'}
                                                        </div>
                                                        <div className="text-muted small">
                                                            <strong>Adresse:</strong> {hist.emplacement_destination?.adresse_empl || 'Non spécifié'}
                                                            {hist.emplacement_destination?.departement?.type_depart === 'DST' && hist.emplacement_destination?.direction?.length > 0 && (
                                                                <div>
                                                                    <strong>Direction:</strong> {hist.emplacement_destination?.direction[0]?.nom_dir} ({hist.emplacement_destination?.direction[0]?.type_dir})
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {new Date(hist.date_mouvement).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted">
                                                    Aucune affectation trouvée
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Modal pour nouvelle affectation */}
                    <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Nouvelle affectation de matériel</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSubmit}>
                                {/* Étape 1 : Sélection du matériel */}
                                {currentStep === 1 && (
                                    <div>
                                        <h6 className="mb-3">1. Sélection du matériel à affecter</h6>
                                        <Row md={10}>
                                            <Col md={4}>
                                                <Form.Label>Type de département</Form.Label>
                                                <Form.Select
                                                    name="type_depart"
                                                    value={filters.type_depart}
                                                    onChange={handleFilterChange}
                                                >
                                                    <option value="">Tous les types</option>
                                                    <option value="DST">DST</option>
                                                    <option value="CIRTOPO">CIRTOPO</option>
                                                </Form.Select>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label>Adresse</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="adresse"
                                                    placeholder="Adresse de l'emplacement"
                                                    value={filters.adresse}
                                                    onChange={handleFilterChange}
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label>Recherche</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="search"
                                                    placeholder="Nom, N° série, marque, modèle"
                                                    value={filters.search}
                                                    onChange={handleFilterChange}
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label>Nom du détenteur</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="nom_dete"
                                                    placeholder="Nom ou prénom"
                                                    value={filters.nom_dete}
                                                    onChange={handleFilterChange}
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label>Matériels attribués uniquement</Form.Label>
                                                <Form.Check
                                                    type="checkbox"
                                                    name="attribue_only"
                                                    checked={filters.attribue_only}
                                                    onChange={handleFilterChange}
                                                    label="Afficher seulement les matériels attribués"
                                                />
                                            </Col>
                                            <Col md={12}>
                                                <Button variant="primary" onClick={fetchMateriels}>
                                                    Rechercher
                                                </Button>
                                            </Col>
                                        </Row>

                                        {showMaterialsTable && (
                                            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                <Table striped bordered hover size="sm" responsive>
                                                    <thead>
                                                        <tr>
                                                            <th width="10%">Sélection</th>
                                                            <th width="15%">N° Série</th>
                                                            <th width="20%">Nom</th>
                                                            <th width="20%">Département</th>
                                                            <th width="35%">Emplacement</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loadingMaterials ? (
                                                            <tr>
                                                                <td colSpan="5" className="text-center">
                                                                    <Spinner animation="border" size="sm" />
                                                                </td>
                                                            </tr>
                                                        ) : materiels.length > 0 ? (
                                                            materiels.map(materiel => (
                                                                <tr key={materiel.code_mat}>
                                                                    <td>
                                                                        <Form.Check
                                                                            type="radio"
                                                                            name="selectedMaterial"
                                                                            checked={formData.code_mat === materiel.code_mat}
                                                                            onChange={() => handleSelectMaterial(materiel)}
                                                                        />
                                                                    </td>
                                                                    <td>{materiel.numero_serie}</td>
                                                                    <td>{materiel.nom}</td>
                                                                    <td>{materiel.nom_depart || 'Non spécifié'}</td>
                                                                    <td>
                                                                        <div>
                                                                            <strong>Ville:</strong> {materiel.ville || 'Non spécifié'}
                                                                        </div>
                                                                        <div className="text-muted small">
                                                                            <strong>Adresse:</strong> {materiel.adresse_empl || 'Non spécifié'}
                                                                            {materiel.type_depart === 'DST' && materiel.nom_dir && (
                                                                                <div>
                                                                                    <strong>Direction:</strong> {materiel.nom_dir} ({materiel.type_dir})
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="5" className="text-center text-muted">
                                                                    Aucun matériel trouvé
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Étape 2 : Emplacement source */}
                                {currentStep === 2 && (
                                    <div>
                                        <h6 className="mb-3">2. Emplacement source (actuel)</h6>
                                        <div className="p-3 rounded bg-light mb-3">
                                            <Row>
                                                <Col md={6}>
                                                    <p>
                                                        <strong>Département:</strong> {selectedMaterial?.nom_depart || 'Non spécifié'}
                                                    </p>
                                                    {selectedMaterial?.type_depart === 'DST' && (
                                                        <>
                                                            <p>
                                                                <strong>Type direction:</strong> {selectedMaterial?.type_dir || 'Non spécifié'}
                                                            </p>
                                                            <p>
                                                                <strong>Nom direction:</strong> {selectedMaterial?.nom_dir || 'Non spécifié'}
                                                            </p>
                                                        </>
                                                    )}
                                                </Col>
                                                <Col md={6}>
                                                    <p>
                                                        <strong>Adresse:</strong> {selectedMaterial?.adresse_empl || 'Non spécifié'}
                                                    </p>
                                                    <p>
                                                        <strong>Ville:</strong> {selectedMaterial?.ville || 'Non spécifié'}
                                                    </p>
                                                    <p>
                                                        <strong>Région:</strong> {selectedMaterial?.Region || 'Non spécifié'}
                                                    </p>
                                                    <p>
                                                        <strong>District:</strong> {selectedMaterial?.distrinct || 'Non spécifié'}
                                                    </p>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                )}

                                {/* Étape 3 : Emplacement de destination */}
                                {currentStep === 3 && (
                                    <div>
                                        <h6 className="mb-3">3. Nouvel emplacement (destination)</h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Label>Département</Form.Label>
                                                <Form.Select
                                                    name="nom_depart"
                                                    value={formData.nom_depart}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            nom_depart: e.target.value,
                                                            type_dir: '',
                                                            nom_dir: ''
                                                        }));
                                                    }}
                                                    required
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    {departements.map(dep => (
                                                        <option key={dep.id_depart} value={dep.nom_depart}>
                                                            {dep.nom_depart} ({dep.type_depart})
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label>Ville</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="ville"
                                                    value={formData.ville}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label>Adresse</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="adresse_empl"
                                                    value={formData.adresse_empl}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label>District</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="distrinct"
                                                    value={formData.distrinct}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label>Région</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="Region"
                                                    value={formData.Region}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            {isDestinationDST && (
                                                <>
                                                    <Col md={6}>
                                                        <Form.Label>Type de direction</Form.Label>
                                                        <Form.Select
                                                            name="type_dir"
                                                            value={formData.type_dir}
                                                            onChange={handleChange}
                                                            required
                                                        >
                                                            <option value="">Sélectionner...</option>
                                                            <option value="Service">Service</option>
                                                            <option value="Division">Division</option>
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Label>Nom de la direction</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="nom_dir"
                                                            value={formData.nom_dir}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </Col>
                                                </>
                                            )}
                                        </Row>
                                    </div>
                                )}
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Annuler
                            </Button>
                            {currentStep > 1 && (
                                <Button variant="outline-primary" onClick={handlePrevious}>
                                    Précédent
                                </Button>
                            )}
                            {currentStep < 3 ? (
                                <Button
                                    variant="primary"
                                    onClick={handleNext}
                                    disabled={currentStep === 1 && !formData.code_mat}
                                >
                                    Suivant
                                </Button>
                            ) : (
                                <Button
                                    variant="success"
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                            En cours...
                                        </>
                                    ) : (
                                        "Enregistrer l'affectation"
                                    )}
                                </Button>
                            )}
                        </Modal.Footer>
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
            </div>
        </div>
    );
}

export default Affectation;

import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Table, Form, Alert, Col, Row } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const API_URL = 'https://gestion-backend-6p1z.onrender.com';
function Avocat() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom_avo: "",
    prenom_avo: "",
    num_im: "",
    specialite: "",
    contact: "",
    adresse_avo: "",
  });
  const [avocats, setAvocats] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    specialite: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avocatToDelete, setAvocatToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // Pour gérer l'édition

  // Fonction récursive pour contrôler la saisie (adaptée de Ajout.jsx)
  const restrictInput = (input, allowedType, maxLength, currentIndex = 0, result = '') => {
    if (currentIndex >= input.length || result.length >= maxLength) {
      return result;
    }

    const currentChar = input[currentIndex];

    const isValidChar = allowedType === 'letters' 
      ? /^[a-zA-Z\s]$/.test(currentChar) 
      : allowedType === 'numbers' 
      ? /^[0-9]$/.test(currentChar)
      : allowedType === 'alphanumeric'
      ? /^[a-zA-Z0-9]$/.test(currentChar)
      : allowedType === 'phone'
      ? /^[0-9\s\-\+]$/.test(currentChar) 
      : false;

    const newResult = isValidChar ? result + currentChar : result;

    return restrictInput(input, allowedType, maxLength, currentIndex + 1, newResult);
  };

  // Charger les avocats avec filtres
  const fetchAvocats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/avocat`, {
        params: { ...filters }
      });
      setAvocats(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des avocats:", err);
      showAlert('Erreur lors du chargement des avocats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAvocats();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Appliquer la validation récursive
    let validatedValue = value;
    if (name === 'contact') {
      validatedValue = restrictInput(value, 'phone', 20);
      if (value !== validatedValue) {
        showAlert("Seuls les chiffres, espaces, tirets et + sont autorisés pour le contact.", 'warning');
      }
    } else if (name === 'nom_avo' || name === 'prenom_avo' || name === 'adresse_avo' || name === 'specialite') {
      validatedValue = restrictInput(value, 'letters', name === 'adresse_avo' ? 50 : 100);
      if (value !== validatedValue) {
        showAlert(`Seules les lettres et les espaces sont autorisés pour ${name}.`, 'warning');
      }
    } else if (name === 'num_im') {
      validatedValue = restrictInput(value, 'numbers', 10);
      if (value !== validatedValue) {
        showAlert("Seuls les chiffres sont autorisés pour le numéro d'immatriculation.", 'warning');
      }
    }

    setFormData(prev => ({ ...prev, [name]: validatedValue }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      specialite: '',
    });
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

  const resetForm = () => {
    setFormData({
      nom_avo: "",
      prenom_avo: "",
      num_im: "",
      specialite: "",
      contact: "",
      adresse_avo: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response;
      if (editingId) {
        // Mise à jour
        response = await axios.put(`${API_URL}/avocat/${editingId}`, formData);
      } else {
        // Création
        response = await axios.post(`${API_URL}/avocat`, formData);
      }
      showAlert(editingId ? 'Avocat mis à jour avec succès' : 'Avocat ajouté avec succès', 'success');
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          resetForm();
          setSubmitSuccess(false);
          fetchAvocats();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/avocat/${id}`);
      setFormData(response.data);
      setEditingId(id);
      setShowModal(true);
    } catch (error) {
      console.error("Erreur lors du chargement pour édition:", error);
      showAlert('Erreur lors du chargement des données', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setAvocatToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/avocat/${avocatToDelete}`);
      showAlert('Avocat supprimé avec succès', 'success');
      fetchAvocats();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(error.response?.data?.message || "Erreur lors de la suppression", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4 mt-3">
            <div className="card-header d-flex justify-content-between align-items-center bg-light">
              <h5 className="mb-0">Liste Avocat</h5>
              <Button 
                variant="primary"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                <FaPlus className="me-2" />
                     Ajouter un Avocat
              </Button>
            </div>
            <div className="card-body">
              {/* Barre de recherche et filtres */}
              <Form className="mb-3">
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Label>Rechercher par nom ou prénom</Form.Label>
                    <Form.Control
                      type="text"
                      name="search"
                      placeholder="Rechercher par nom, prénom, matricule"
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Spécialité</Form.Label>
                    <Form.Control
                      type="text"
                      name="specialite"
                      value={filters.specialite}
                      onChange={handleFilterChange}
                    />
                  </Col>
                  <Col>
                    <Form.Label>&nbsp;</Form.Label>
                    <Button variant="outline-danger" onClick={resetFilters}>
                      <FaTimes />
                    </Button>
                  </Col>
                </Row>
              </Form>      
              <div className="table-responsive small">
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th style={{ color: "GrayText" }} scope="col">Nom</th>
                      <th style={{ color: "GrayText" }} scope="col">Prénom</th>
                      <th style={{ color: "GrayText" }} scope="col">Numéro Immatricule</th>
                      <th style={{ color: "GrayText" }} scope="col">Spécialité</th>
                      <th style={{ color: "GrayText" }} scope="col">Contact</th>
                      <th style={{ color: "GrayText" }} scope="col">Adresse</th>
                      <th style={{ color: "GrayText" }} scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avocats.map(a => (
                      <tr key={a.code_avo}>
                        <td>{a.nom_avo}</td>
                        <td>{a.prenom_avo}</td>
                        <td>{a.num_im}</td>
                        <td>{a.specialite}</td>
                        <td>{a.contact}</td>
                        <td>{a.adresse_avo}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(a.code_avo)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(a.code_avo)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>

          {/* Modal pour ajouter/éditer un avocat */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" style={{marginTop: "2rem"}}>
            <Modal.Header closeButton>
              <Modal.Title>{editingId ? 'Modifier un Avocat' : 'Ajouter un Avocat'}</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
              <Modal.Body>
                {submitSuccess ? (
                  <Alert variant="primary">
                    Avocat {editingId ? 'mis à jour' : 'ajouté'} avec succès !
                  </Alert>
                ) : (
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Nom de l'Avocat </Form.Label>
                      <Form.Control
                        type="text"
                        name="nom_avo"
                        value={formData.nom_avo}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Prénom de l'Avocat </Form.Label>
                      <Form.Control
                        type="text"
                        name="prenom_avo"
                        value={formData.prenom_avo}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Numéro Immatricule </Form.Label>
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
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Contact </Form.Label>
                      <Form.Control
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Adresse </Form.Label>
                      <Form.Control
                        type="text"
                        name="adresse_avo"
                        value={formData.adresse_avo}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Row>
                )}
              </Modal.Body>
              <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
                  Annuler
                </Button>
                {!submitSuccess && (
                  <Button variant="success" type="submit" disabled={loading}>
                    {loading ? 'En cours...' : (editingId ? 'Mettre à jour' : 'Enregistrer')}
                  </Button>
                )}
              </Modal.Footer>
            </form>
          </Modal>

          {/* Modal de confirmation de suppression */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmation de suppression</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Êtes-vous sûr de vouloir supprimer cet avocat ? Cette action est irréversible.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={loading}>
                {loading ? 'Suppression...' : 'Supprimer'}
              </Button>
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

export default Avocat;
import { useState, useEffect } from "react";
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = 'https://gestion-backend-6p1z.onrender.com';
function EditMateriel() {
  const { id } = useParams(); // Récupérer l'ID du matériel depuis l'URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type_aff:"", 
    date_aff:"",
    statut:"",
    description:"",
    nom_cli:"",
    prenom_cli:"",
    adresse_cli:"",
    contact_cli:"",
    nom_avo:"",
    prenom_avo:"",
    num_im:"",
    specialite:"",
    contact:"",
    adresse_avo:"",
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les données initiales (catégories, départements, et matériel)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [materielRes] = await Promise.all([    
          axios.get(`${API_URL}/affaire/${id}`)
        ]);

        const affaire = materielRes.data;
        console.log("Affaire chargé:", affaire);

        // Formater la date au format YYYY-MM-DD
        let dateUtilisation = '';
        if (affaire.date_aff) {
          try {
            const date = new Date(affaire.date_aff);
            if (!isNaN(date.getTime())) {
              dateUtilisation = date.toISOString().split('T')[0];
            } else if (typeof affaire.date_aff === 'string') {
              const parts = affaire.date_aff.split(/[-T]/);
              if (parts.length >= 3) {
                dateUtilisation = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              }
            }
          } catch (error) {
            console.warn("Erreur lors du formatage de la date:", error);
          }
        }


        setFormData({
          type_aff: affaire.type_aff, 
          date_aff:affaire.date_aff || "",
          statut:affaire.statut ||"",
          description:affaire.description ||"",
          nom_cli:affaire.Client?.nom_cli ||"",
          prenom_cli:affaire.Client?.prenom_cli ||"",
          adresse_cli:affaire.Client?.adresse_cli ||"",
          contact_cli:affaire.Client?.contact_cli ||"",
          nom_avo:affaire.Avocat?.nom_avo ||"",
          prenom_avo:affaire.Avocat?.prenom_avo ||"",
          num_im:affaire.Avocat?.num_im ||"",
          specialite:affaire.Avocat?.specialite ||"",
          contact:affaire.Avocat?.contact ||"",
          adresse_avo:affaire.Avocat?.adresse_avo ||"",

        });
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        showAlert('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (name === "num_depa") {
      const selectedDep = departements.find(dep => String(dep.id_depart) === value);
      setFormData(prev => ({
        ...prev,
        num_depa: value,
        type_dir: selectedDep?.type_depart === "DST" ? prev.type_dir : "",
        nom_dir: selectedDep?.type_depart === "DST" ? prev.nom_dir : ""
      }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.attribue && (!formData.nom_det || !formData.prenom_det)) {
      showAlert("Veuillez remplir les informations du détenteur ou décocher 'Matériel attribué'", 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/affaire/${id}`, formData);
      showAlert('Affaire modifié avec succès', 'success');
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          navigate('/ajout');
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <h2>Page de Modification de l'Affaire</h2>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <>
          {submitSuccess ? (
            <Alert variant="success">
              Affaire modifié avec succès !
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              {/* Carte 1: Informations de l'équipement */}
              <Card className="mb-4">
                <Card.Header className="text-white" style={{background:'#162caad5'}}>
                  <h5 className="mb-0">Informations de l'Affaire ({formData.type_aff}-{formData.statut})</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Type de l'Affaire</Form.Label>
                      <Form.Control
                        name="type_aff"
                        value={formData.type_aff}
                        onChange={handleChange}
                        required
                      >
                        
                      </Form.Control>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Statut</Form.Label>
                      <Form.Select
                        type="text"
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        required
                      >
                          <option value="non regler">non regler</option>
                          <option value="regler">regler</option>

                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label>date de l'affaire</Form.Label>
                      <Form.Control
                        type="date"
                        name="date_aff"
                        value={formData.date_aff}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                    
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </Col>
             
                  </Row>
                </Card.Body>
              </Card>

              {/* Carte 2: Emplacement */}
              <Card className="mb-4">
                <Card.Header className="text-white" style={{background:'#162caad5'}}>
                  <h5 className="mb-0">Avocat</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Nom de l'Avocat</Form.Label>
                      <Form.Control
                        name="nom_avo"
                        value={formData.nom_avo}
                        onChange={handleChange}
                        required
                      />
                       
                    </Col>
                    <Col md={6}>
                      <Form.Label>Prenom de l'Avocat</Form.Label>
                      <Form.Control
                        type="text"
                        name="prenom_avo"
                        value={formData.prenom_avo}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Adresse</Form.Label>
                      <Form.Control
                        type="text"
                        name="adresse_avo"
                        value={formData.adresse_avo}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Contact</Form.Label>
                      <Form.Control 
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Specialite</Form.Label>
                      <Form.Control 
                        type="text"
                        name="specialite"
                        value={formData.specialite}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Numero Immatricule</Form.Label>
                      <Form.Control
                        type="text"
                        name="num_im"
                        value={formData.num_im}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Carte 5: Fournisseur */}
              <Card className="mb-4">
                <Card.Header className="text-white" style={{background:'#162caad5'}}>
                  <h5 className="mb-0">Client</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Nom du Client</Form.Label>
                      <Form.Control
                        type="text"
                        name="nom_cli"
                        value={formData.nom_cli}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Prenom du Client</Form.Label>
                      <Form.Control
                        type="text"
                        name="prenom_cli"
                        value={formData.prenom_cli}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Adresse</Form.Label>
                      <Form.Control
                        type="text"
                        name="adresse_cli"
                        value={formData.adresse_cli}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Contact du Client</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact_cli"
                        value={formData.contact_cli}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Boutons de soumission */}
              <div className="d-flex justify-content-between mt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/ajout')}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  variant="success"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'En cours...' : 'Modifier'}
                </Button>
              </div>
            </Form>
          )}
        </>
      )}

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

export default EditMateriel;
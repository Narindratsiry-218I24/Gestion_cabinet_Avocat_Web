
import React, { useState } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button, Spinner, Col, Row } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


const API_URL = 'https://gestion-backend-6p1z.onrender.com';
function PaiementRapport() {
const [paiements, setPaiements] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [showTable, setShowTable] = useState(false);
const [filters, setFilters] = useState({
  date_pay: '',
  nom_cli: '',
  prenom_cli: '',
});

const getDynamicTitle = () => {
  let title = "Rapport des Paiements pour Facture Client";
  if (filters.nom_cli || filters.prenom_cli) {
    title += ` - Client ${filters.nom_cli} ${filters.prenom_cli}`;
  }
  if (filters.date_pay) {
    title += ` - Date ${new Date(filters.date_pay).toLocaleDateString()}`;
  }
  return title;
};

// Regrouper les paiements par client pour factures multiples si besoin
const groupByClient = (paiements) => {
  const grouped = {};
  paiements.forEach(p => {
    const clientId = p.code_cli;
    if (!grouped[clientId]) {
      grouped[clientId] = {
        client: p.Client,
        paiements: [],
        affaire: p.Affaire, 
        totalPaye: 0,
        montantInitial: parseFloat(p.Affaire?.MontantInitial || p.Affaire?.Montant || 0) + paiements.reduce((sum, pp) => sum + parseFloat(pp.cout), 0), // Calcul approximatif
        montantRestant: 0,
      };
    }
    grouped[clientId].paiements.push(p);
    grouped[clientId].totalPaye += parseFloat(p.cout);
  });
  Object.values(grouped).forEach(group => {
    group.montantRestant = group.montantInitial - group.totalPaye;
  });
  return Object.values(grouped);
};

const exportToPDF = (e) => {
  e.preventDefault();
  const groupedByClient = groupByClient(paiements);
  
  groupedByClient.forEach((group, index) => {
    const doc = new jsPDF();
    doc.setFont("times");

    // Zone texte concernant le client
    const clientInfo = group.client;
    doc.setFontSize(18);
    doc.text("Facture Paiement Client", 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text("Informations Client :", 14, 40);
    doc.setFontSize(10);
    doc.text(`Nom: ${clientInfo.nom_cli || 'N/A'} ${clientInfo.prenom_cli || ''}`, 14, 50);
    doc.text(`Adresse: ${clientInfo.adresse_cli || 'N/A'}`, 14, 60);
    doc.text(`Contact: ${clientInfo.contact_cli || 'N/A'}`, 14, 70);

    // Infos affaire et totaux
    const affaireInfo = group.affaire;
    doc.text(`Affaire: ${affaireInfo.type_aff || 'N/A'} (Code: ${affaireInfo.code_aff})`, 14, 90);
    doc.text(`Montant Total Initial: ${group.montantInitial.toFixed(2)} AR`, 14, 100);
    doc.text(`Total Payé: ${group.totalPaye.toFixed(2)} AR`, 14, 110);
    doc.text(`Montant Restant: ${group.montantRestant.toFixed(2)} AR`, 14, 120);

    // Tableau des paiements
    autoTable(doc, {
      startY: 130,
      head: [['Date Paiement', 'Montant Payé (AR)', 'Code Affaire']],
      body: group.paiements.map(pay => [
        new Date(pay.date_pay).toLocaleDateString(),
        parseFloat(pay.cout).toFixed(2),
        pay.code_aff
      ]),
      styles: { font: 'times', fontSize: 8 },
      headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 130 }
    });

    const dateStr = new Date().toLocaleString('fr-FR', { timeZone: 'Indian/Antananarivo' });
    doc.setFontSize(8);
    doc.text(`Exporté le : ${dateStr} - ${group.paiements.length} paiements`, 14, doc.lastAutoTable.finalY + 10);

    const dateFileStr = new Date().toISOString().slice(0, 10);
    const fileName = `Facture_Client_${clientInfo.nom_cli}_${clientInfo.prenom_cli}_${dateFileStr}.pdf`;
    doc.save(fileName);
  });

  if (groupedByClient.length === 0) {
    alert('Aucun paiement trouvé pour générer la facture.');
  }
};

const fetchPaiements = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(`${API_URL}/paiements`, {
      params: { ...filters }
    });
    setPaiements(response.data);
    setShowTable(true);
  } catch (err) {
    setError('Erreur lors de la récupération des paiements');
    console.error(err);
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
    date_pay: '',
    nom_cli: '',
    prenom_cli: '',
  });
  setShowTable(false);
  setPaiements([]);
};

return (
  <div className="container-fluid mt-4">
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h6 className="mb-0">Filtrer les Paiements par Client et Date pour Facture</h6>
      </Card.Header>
      <Card.Body>
        <Row className="g-3 mb-3">
          <Col md={3}>
            <Form.Label>Date Paiement</Form.Label>
            <Form.Control
              type="date"
              name="date_pay"
              value={filters.date_pay}
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
          <Col md={3}>
            <Form.Label>Code Affaire (optionnel)</Form.Label>
            <Form.Control
              type="text"
              name="code_aff"
              placeholder="Filtre supplémentaire"
              value={filters.code_aff || ''}
              onChange={handleFilterChange}
            />
          </Col>
        </Row>
        <Row className="g-3">
          <Col md={2}>
            <Button
              variant="secondary"
              onClick={resetFilters}
              disabled={!filters.date_pay && !filters.nom_cli && !filters.prenom_cli}
            >
              Réinitialiser
            </Button>
          </Col>
          <Col md={2}>
            <Button
              variant="primary"
              onClick={fetchPaiements}
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
        <p>Chargement des paiements...</p>
      </div>
    ) : error ? (
      <p className="text-danger">{error}</p>
    ) : showTable && paiements.length > 0 ? (
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4>{getDynamicTitle()}</h4>
            <div>
              <a 
                href="#" 
                onClick={exportToPDF} 
                className="me-2"
                style={{ color: 'red', textDecoration: 'underline' }}
              >
                Exporter Facture Client en PDF
              </a>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date Paiement</th>
                <th>Montant (AR)</th>
                <th>Nom Client</th>
                <th>Prénom Client</th>
                <th>Code Affaire</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((pay) => (
                <tr key={pay.code_pay}>
                  <td>{new Date(pay.date_pay).toLocaleDateString()}</td>
                  <td>{parseFloat(pay.cout).toFixed(2)}</td>
                  <td>{pay.Client?.nom_cli || '-'}</td>
                  <td>{pay.Client?.prenom_cli || '-'}</td>
                  <td>{pay.code_aff}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    ) : showTable && paiements.length === 0 ? (
      <Card>
        <Card.Body>Aucun paiement trouvé pour ces critères de client.</Card.Body>
      </Card>
    ) : null}
  </div>
);
}

export default PaiementRapport;
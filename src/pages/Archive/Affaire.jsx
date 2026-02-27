// AffaireRapport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button, Spinner, Col, Row, Badge } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = 'https://gestion-backend-6p1z.onrender.com';

function AffaireRapport() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type_aff: '',
    statut: '',
    date_aff: '',
  });

  const getDynamicTitle = () => {
    let title = "Rapport des Affaires";
    if (filters.statut) {
      title += ` - Statut ${filters.statut}`;
    }
    if (filters.type_aff) {
      title += ` - Type ${filters.type_aff}`;
    }
    if (filters.date_aff) {
      title += ` - Date ${new Date(filters.date_aff).toLocaleDateString()}`;
    }
    return title;
  };

  const exportToExcel = (e) => {
    e.preventDefault();
    const worksheet = XLSX.utils.json_to_sheet(affaires.map(aff => ({
      'Type Affaire': aff.type_aff || '-',
      'Description': aff.description || '-',
      'Statut': aff.statut,
      'Montant': aff.Montant,
      'Client': aff.Client?.nom_cli || '-',
      'Avocat': aff.Avocat?.nom_avo || '-',
      'Date Affaire': new Date(aff.date_aff).toLocaleDateString()
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Affaires");
    
    const dateStr = new Date().toISOString().slice(0, 10);
    let fileName = `Affaires_${dateStr}`;
    if (filters.statut) fileName += `_${filters.statut}`;
    if (filters.type_aff) fileName += `_${filters.type_aff}`;
    
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToPDF = (e) => {
    e.preventDefault();
    const doc = new jsPDF();
    doc.setFont("times");

    doc.setFontSize(18);
    doc.text(getDynamicTitle(), 105, 20, { align: 'center' });

    doc.setFontSize(10);
    let filtersText = "Filtres appliqués : ";
    const appliedFilters = [];
    if (filters.search) appliedFilters.push(`Recherche "${filters.search}"`);
    if (filters.type_aff) appliedFilters.push(`Type ${filters.type_aff}`);
    if (filters.statut) appliedFilters.push(`Statut ${filters.statut}`);
    if (filters.date_aff) appliedFilters.push(`Date ${new Date(filters.date_aff).toLocaleDateString()}`);
    filtersText += appliedFilters.length > 0 ? appliedFilters.join(', ') : "Aucun";
    
    doc.text(filtersText, 14, 60);

    autoTable(doc, {
      startY: 65,
      head: [['Type Affaire', 'Description', 'Statut', 'Client', 'Avocat', 'Date Affaire']],
      body: affaires.map(aff => [
        aff.type_aff || '-',
        aff.description || '-',
        aff.statut,
      
        aff.Client?.nom_cli || '-',
        aff.Avocat?.nom_avo || '-',
        new Date(aff.date_aff).toLocaleDateString()
      ]),
      styles: { font: 'times', fontSize: 8 },
      headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 65 }
    });

    const dateStr = new Date().toLocaleString('fr-FR', { timeZone: 'Indian/Antananarivo' });
    doc.setFontSize(8);
    doc.text(`Exporté le : ${dateStr} - ${affaires.length} affaires`, 14, doc.lastAutoTable.finalY + 10);

    const dateFileStr = new Date().toISOString().slice(0, 10);
    let fileName = `Affaires_${dateFileStr}`;
    if (filters.statut) fileName += `_${filters.statut}`;
    if (filters.type_aff) fileName += `_${filters.type_aff}`;
    
    doc.save(`${fileName}.pdf`);
  };

  const fetchAffaires = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/affaire`, {
        params: { ...filters }
      });
      setAffaires(response.data);
      setShowTable(true);
    } catch (err) {
      setError('Erreur lors de la récupération des affaires');
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
      search: '',
      type_aff: '',
      statut: '',
      date_aff: new Date().toISOString().slice(0, 10)
    });
    setShowTable(false);
    setAffaires([]);
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'en_cours': return <Badge bg="dark">En cours</Badge>;
      case 'terminee': return <Badge bg="success">Terminée</Badge>;
      case 'annulee': return <Badge bg="danger">Annulée</Badge>;
      default: return <Badge bg="secondary">{statut}</Badge>;
    }
  };

  return (
    <div className="container-fluid mt-4">
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0">Filtrer les Affaires</h6>
        </Card.Header>
        <Card.Body>
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Label>Rechercher</Form.Label>
              <Form.Control
                type="text"
                name="search"
                placeholder="Type, client, avocat"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Type d'affaire</Form.Label>
              <Form.Select
                name="type_aff"
                value={filters.type_aff}
                onChange={handleFilterChange}
              >
                <option value="">Tous les types</option>
                <option value="civile">Civile</option>
                <option value="penale">Pénale</option>
                <option value="commerciale">Commerciale</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
              >
                <option value="">Tous les statuts</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Date d'affaire</Form.Label>
              <Form.Control
                type="date"
                name="date_aff"
                value={filters.date_aff}
                onChange={handleFilterChange}
              />
            </Col>
          </Row>
          <Row className="g-3">
            <Col md={2}>
              <Button
                variant="secondary"
                onClick={resetFilters}
                disabled={!filters.search && !filters.type_aff && !filters.statut && 
                          filters.date_aff === new Date().toISOString().slice(0, 10)}
              >
                Réinitialiser
              </Button>
            </Col>
            <Col md={2}>
              <Button
                variant="primary"
                onClick={fetchAffaires}
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
          <p>Chargement des affaires...</p>
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : showTable && affaires.length > 0 ? (
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
                  Exporter en PDF
                </a>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Type Affaire</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Client</th>
                  <th>Avocat</th>
                  <th>Date Affaire</th>
                </tr>
              </thead>
              <tbody>
                {affaires.map((aff) => (
                  <tr key={aff.code_aff}>
                    <td>{aff.type_aff || '-'}</td>
                    <td>{aff.description || '-'}</td>
                    <td>{getStatusBadge(aff.statut)}</td>
                   
                    <td>{aff.Client?.nom_cli || '-'}</td>
                    <td>{aff.Avocat?.nom_avo || '-'}</td>
                    <td>{new Date(aff.date_aff).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : showTable && affaires.length === 0 ? (
        <Card>
          <Card.Body>Aucune affaire trouvée pour ces critères.</Card.Body>
        </Card>
      ) : null}
    </div>
  );
}

export default AffaireRapport;
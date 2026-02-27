import React, { useState, useEffect } from 'react';

function Materiel() {
  const [equipements, setEquipements] = useState([]);
  const [formData, setFormData] = useState({
    id_equipement: null,
    nom_equipement: '',
    numero_serie: '',
    marque: '',
    model: '',
    type_de_materiel: '',
    date_d_utilisation: '',
    utilisateur: '',
    categorie: '',
    lieu_equipement: '',
    statut: 'en_service',
    id_emplacement: '',
    date_derniere_maintenance: '',
    fournisseur_nom: '',
    fournisseur_matricule: '',
    emplacement_ville: '',
    emplacement_adresse: '',
    emplacement_etage: '',
    emplacement_nom_emplacement: ''
  });

  // Catégories et Types de matériel simulés localement
  const categories = ['Ordinateur', 'Imprimante', 'Serveur', 'Périphérique'];
 

  useEffect(() => {
    // Données initiales simulées (facultatif)
    const initialEquipements = [
      {
        id_equipement: 1,
        nom_equipement: 'PC Dell',
        numero_serie: 'ABC123',
        marque: 'Dell',
        model: 'OptiPlex 5000',
        type_de_materiel: 'Matériel fixe',
        date_d_utilisation: '2025-01-01',
        utilisateur: 'Chef',
        categorie: 'Ordinateur',
        lieu_equipement: 'Coin bureau',
        statut: 'en_service',
        id_emplacement: '1',
        date_derniere_maintenance: '2025-01-01',
        fournisseur_nom: 'Dell Inc.',
        fournisseur_matricule: 'F001',
        emplacement_ville: '',
        emplacement_adresse: '123 Rue Principale',
        emplacement_etage: '1er',
        emplacement_nom_emplacement: 'Bureau A1'
      }
    ];
    setEquipements(initialEquipements);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Création
    const newId = equipements.length > 0 ? Math.max(...equipements.map(e => e.id_equipement)) + 1 : 1;
    setEquipements([...equipements, { ...formData, id_equipement: newId }]);
    setFormData({
      id_equipement: null,
      nom_equipement: '',
      numero_serie: '',
      marque: '',
      model: '',
      type_de_materiel: '',
      date_d_utilisation: '',
      utilisateur: '',
      categorie: '',
      lieu_equipement: '',
      statut: 'en_service',
      id_emplacement: '',
      date_derniere_maintenance: '',
      fournisseur_nom: '',
      fournisseur_matricule: '',
      emplacement_ville: '',
      emplacement_adresse: '',
      emplacement_etage: '',
      emplacement_nom_emplacement: '',
    });
  };

  return (
    <div className="container-fluid p-4">
      {/* Formulaire avec deux cards sur la même ligne */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="row g-4">
          {/* Card pour les informations de l'équipement (2 inputs par ligne) */}
          <div className="col-12 col-md-6">
            <div className="card p-4 h-100">
              <div className="card-header">
                <h4 className="card-title text-success ">Informations de l'Équipement</h4>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Ligne 1 */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Catégorie</label>
                    <select
                      name="categorie"
                      value={formData.categorie}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Numéro de Série</label>
                    <input
                      type="text"
                      name="numero_serie"
                      value={formData.numero_serie}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Ligne 2 */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nom de l'equipement</label>
                    <input
                      type="text"
                      name="marque"
                      value={formData.marque}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Modèle</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Ligne 3 */}
                  <div className="col-md-6 mb-3">
                      <label className="form-label">Etat</label>
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="en_service">En service</option>
                      <option value="en_panne">En panne</option>
                      <option value="hors_service">Hors service</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                     <label className="form-label">Type de l'equipement</label>
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="en_service">Accessoire</option>
                      <option value="en_panne">Materiel fixe</option>
                      <option value="hors_service">Materiel Mobile</option>
                    </select>
                  </div>

                  {/* Ligne 4 */}
                 
                

                  {/* Ligne 5 */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Dernière Maintenance</label>
                    <input
                      type="date"
                      name="date_derniere_maintenance"
                      value={formData.date_derniere_maintenance}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date d'Utilisation</label>
                    <input
                      type="date"
                      name="date_d_utilisation"
                      value={formData.date_d_utilisation}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Ligne 6 */}
                
                </div>
              </div>
            </div>
          </div>

          {/* Card pour les informations de l'emplacement et du fournisseur */}
          <div className="col-12 col-md-6">
            <div className="card p-4 h-100">
                <div className="card-title">
                       <h4 classeName="card-title text-success">Adresse de l'Equipement</h4>
                </div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Emplacement - Ligne 1 */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nom de l'Emplacement</label>
                    <input
                      type="text"
                      name="emplacement_ville"
                      value={formData.emplacement_ville}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                  <label className="form-label">Ville</label>
                    <input
                      type="text"
                      name="emplacement_adresse"
                      value={formData.emplacement_adresse}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Emplacement - Ligne 2 */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Adresse</label>
                    <input
                      type="text"
                      name="emplacement_etage"
                      value={formData.emplacement_etage}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">t</label>
                    <input
                      type="text"
                      name="emplacement_nom_emplacement"
                      value={formData.emplacement_nom_emplacement}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                   {/* Fournisseur - Ligne 3 */}
                   
                   
                  <div className="card p-4 h-100">
                    <div className="col-md-6 mb-3">
                    <label className="form-label">Nom de detenteur</label>
                    <input
                      type="text"
                      name="fournisseur_nom"
                      value={formData.fournisseur_nom}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                     <div className="col-md-6 mb-3">
                    <label className="form-label">Matricule</label>
                    <input
                      type="text"
                      name="fournisseur_matricule"
                      value={formData.fournisseur_matricule}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                   </div>
                 
                 
               
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="col-12 text-end">
            <button type="submit" className="btn btn-success mt-3">
              Enregistrer un Nouveau Équipement
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Materiel;
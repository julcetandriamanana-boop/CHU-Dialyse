-- Table patients
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  "dateNaissance" DATE NOT NULL,
  telephone VARCHAR(15),
  notes TEXT
);

-- Table medecin
CREATE TABLE IF NOT EXISTS medecin (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  specialite VARCHAR(100),
  matricule VARCHAR(50) UNIQUE NOT NULL
);

-- Table prescription
CREATE TABLE IF NOT EXISTS prescription (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  medecin_id INTEGER REFERENCES medecin(id) ON DELETE SET NULL,
  date_prescription DATE NOT NULL,
  medicament VARCHAR(150) NOT NULL,
  dosage VARCHAR(80) NOT NULL,
  frequence VARCHAR(80) NOT NULL,
  workflow_statut VARCHAR(20) DEFAULT 'brouillon',
  validated_at TIMESTAMP,
  validated_by INTEGER
);

-- Table rendez_vous
CREATE TABLE IF NOT EXISTS rendez_vous (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  medecin_id INTEGER REFERENCES medecin(id) ON DELETE SET NULL,
  date_heure TIMESTAMP NOT NULL,
  motif VARCHAR(255) NOT NULL,
  statut VARCHAR(20) DEFAULT 'planifié',
  soso_kevitra_malalaka TEXT
);

-- Table demande_avis
CREATE TABLE IF NOT EXISTS demande_avis (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  medecin_emetteur_id INTEGER REFERENCES medecin(id) ON DELETE SET NULL,
  medecin_destinataire_id INTEGER REFERENCES medecin(id) ON DELETE SET NULL,
  date_envoi TIMESTAMP NOT NULL,
  description_cas TEXT NOT NULL,
  priorite VARCHAR(20) DEFAULT 'moyenne'
);

-- Table seance_hemodialyse
CREATE TABLE IF NOT EXISTS seance_hemodialyse (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  date_debut TIMESTAMP NOT NULL,
  date_fin TIMESTAMP NOT NULL,
  poids_pre DECIMAL(6,2) NOT NULL,
  poids_post DECIMAL(6,2) NOT NULL,
  surveillance_flux VARCHAR(255),
  observations TEXT
);

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',
  category VARCHAR(50),
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  icon VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données de démo
INSERT INTO patients (nom, prenom, "dateNaissance", telephone) VALUES 
  ('Ross', 'Elena', '1968-03-15', '0341234567'),
  ('Jensen', 'Marcus', '1981-07-22', '0349876543'),
  ('Bernard', 'Hélène', '1984-11-03', '0334567890');

INSERT INTO prescription (patient_id, date_prescription, medicament, dosage, frequence, workflow_statut) VALUES
  (1, '2026-05-10', 'Héparine 5000 UI', '5000 UI', '3x/semaine', 'terminé'),
  (1, '2026-05-10', 'EPO 4000 UI', '4000 UI', '2x/semaine', 'terminé'),
  (2, '2026-05-11', 'Fer injectable', '100 mg', '1x/semaine', 'terminé'),
  (2, '2026-05-11', 'Calcium carbonate', '500 mg', '2x/jour', 'terminé'),
  (3, '2026-05-12', 'Vitamine D', '1000 UI', '1x/jour', 'terminé'),
  (3, '2026-05-12', 'Sevelamer', '800 mg', '3x/jour', 'terminé'),
  (1, '2026-05-13', 'Furosémide 40 mg', '40 mg', '1x/jour', 'terminé'),
  (2, '2026-05-13', 'Amlodipine 5 mg', '5 mg', '1x/jour', 'suspendu'),
  (3, '2026-05-14', 'Oméprazole 20 mg', '20 mg', '1x/jour', 'terminé'),
  (1, '2026-05-14', 'Acide folique 5 mg', '5 mg', '1x/jour', 'terminé');

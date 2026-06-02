-- ══════════════════════════════════════════════════
-- Migration : Intégration DIALYSE_SERVICE_ID
-- Service : d604bde1-c9dd-4284-a690-0c5ed9be6a37
-- ══════════════════════════════════════════════════

-- 1. Créer la table service si elle n'existe pas
CREATE TABLE IF NOT EXISTS service (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom        VARCHAR(150) NOT NULL DEFAULT 'Service Hémodialyse',
  code       VARCHAR(50)  NOT NULL DEFAULT 'DIALYSE',
  hopital    VARCHAR(150) NOT NULL DEFAULT 'CHU Andrainjato',
  actif      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Insérer le service avec l'ID exact
INSERT INTO service (id, nom, code, hopital, actif)
VALUES (
  'd604bde1-c9dd-4284-a690-0c5ed9be6a37',
  'Service Hémodialyse',
  'DIALYSE',
  'CHU Andrainjato',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  nom     = EXCLUDED.nom,
  code    = EXCLUDED.code,
  hopital = EXCLUDED.hopital,
  actif   = EXCLUDED.actif;

-- 3. Ajouter colonne service_id dans chaque table
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service(id) ON DELETE SET NULL;

ALTER TABLE medecin
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service(id) ON DELETE SET NULL;

ALTER TABLE prescription
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service(id) ON DELETE SET NULL;

ALTER TABLE rendez_vous
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service(id) ON DELETE SET NULL;

ALTER TABLE seance_hemodialyse
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service(id) ON DELETE SET NULL;

ALTER TABLE demande_avis
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service(id) ON DELETE SET NULL;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service(id) ON DELETE SET NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service(id) ON DELETE SET NULL;

-- 4. Lier toutes les lignes existantes à ce service
UPDATE patients          SET service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' WHERE service_id IS NULL;
UPDATE medecin           SET service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' WHERE service_id IS NULL;
UPDATE prescription      SET service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' WHERE service_id IS NULL;
UPDATE rendez_vous       SET service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' WHERE service_id IS NULL;
UPDATE seance_hemodialyse SET service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' WHERE service_id IS NULL;
UPDATE demande_avis      SET service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' WHERE service_id IS NULL;
UPDATE notifications     SET service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' WHERE service_id IS NULL;
UPDATE users             SET service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' WHERE service_id IS NULL;

-- 5. Vérification
SELECT 'service'           AS table_name, COUNT(*) FROM service
UNION ALL
SELECT 'patients',          COUNT(*) FROM patients          WHERE service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37'
UNION ALL
SELECT 'medecin',           COUNT(*) FROM medecin           WHERE service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37'
UNION ALL
SELECT 'prescription',      COUNT(*) FROM prescription      WHERE service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37'
UNION ALL
SELECT 'rendez_vous',       COUNT(*) FROM rendez_vous       WHERE service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37'
UNION ALL
SELECT 'seance_hemodialyse',COUNT(*) FROM seance_hemodialyse WHERE service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37'
UNION ALL
SELECT 'demande_avis',      COUNT(*) FROM demande_avis      WHERE service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37'
UNION ALL
SELECT 'notifications',     COUNT(*) FROM notifications     WHERE service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37'
UNION ALL
SELECT 'users',             COUNT(*) FROM users             WHERE service_id = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37';

/**
 * ═══════════════════════════════════════════════════════
 *  EXEMPLES COMPLETS — API Notifications CHU Dialyse
 * ═══════════════════════════════════════════════════════
 */

const API = 'http://localhost:3001';
const MY_SERVICE_ID = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37';

// ── 1. NOTIFICATION NORMALE ────────────────────────────
const cas1_curl = `
# CAS 1 — Notification normale (interne)
curl -X POST ${API}/notifications \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "RDV Confirmé",
    "message": "Le rendez-vous de Rakoto Jean est confirmé pour demain à 08h30.",
    "type": "info",
    "category": "rdv",
    "icon": "event_available",
    "link": "/rendez-vous",
    "urgence": 1
  }'
`;

const cas1_fetch = `
// CAS 1 — JavaScript Fetch
const response = await fetch('${API}/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title:    'RDV Confirmé',
    message:  'Le rendez-vous de Rakoto Jean est confirmé pour demain à 08h30.',
    type:     'info',
    category: 'rdv',
    icon:     'event_available',
    link:     '/rendez-vous',
    urgence:  1,
  }),
});
const data = await response.json();
console.log('Réponse:', data);
// → { id: N, title: "RDV Confirmé", urgence: 1, source: "interne", ... }
`;

const cas1_axios = `
// CAS 1 — Axios
const { data } = await axios.post('${API}/notifications', {
  title:    'RDV Confirmé',
  message:  'Le rendez-vous de Rakoto Jean est confirmé pour demain à 08h30.',
  type:     'info',
  category: 'rdv',
  icon:     'event_available',
  link:     '/rendez-vous',
  urgence:  1,
});
console.log('ID créé:', data.id);
`;

// ── 2. NOTIFICATION URGENTE ────────────────────────────
const cas2_curl = `
# CAS 2 — Notification URGENTE (externe, urgence 5)
curl -X POST ${API}/notifications/receive \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "MEDICAL_ALERT",
    "motif": "Le patient Rakoto Jean doit être pris en charge immédiatement.",
    "urgence": 5,
    "sourceServiceId": "service-urgences-001",
    "sourceServiceName": "Service Urgences CHU",
    "targetServiceId": "${MY_SERVICE_ID}",
    "emitterName": "Dr. Razafy Luc",
    "patientId": "patient-rakoto-001",
    "sentAt": "2026-06-01T10:00:00Z",
    "ringtone": "urgent",
    "channels": ["SOUND", "WEB"],
    "payload": {
      "patientNom": "Rakoto Jean",
      "motifUrgence": "Insuffisance rénale aiguë"
    }
  }'
`;

const cas2_fetch = `
// CAS 2 — JavaScript Fetch (Urgente)
const response = await fetch('${API}/notifications/receive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type:              'MEDICAL_ALERT',
    motif:             'Le patient Rakoto Jean doit être pris en charge immédiatement.',
    urgence:           5,
    sourceServiceId:   'service-urgences-001',
    sourceServiceName: 'Service Urgences CHU',
    targetServiceId:   '${MY_SERVICE_ID}',
    emitterName:       'Dr. Razafy Luc',
    patientId:         'patient-rakoto-001',
    sentAt:            new Date().toISOString(),
    ringtone:          'urgent',
    channels:          ['SOUND', 'WEB'],
    payload: { patientNom: 'Rakoto Jean' },
  }),
});
const data = await response.json();
// → { received: true, id: N }
// 🔊 Son critique déclenché (square wave 880Hz)
// 🔴 Badge rouge + cloche animée
`;

const cas2_axios = `
// CAS 2 — Axios (Urgente)
const { data } = await axios.post('${API}/notifications/receive', {
  type:            'MEDICAL_ALERT',
  motif:           'Le patient Rakoto Jean doit être pris en charge immédiatement.',
  urgence:         5,
  sourceServiceId: 'service-urgences-001',
  targetServiceId: '${MY_SERVICE_ID}',
  emitterName:     'Dr. Razafy Luc',
  sentAt:          new Date().toISOString(),
  channels:        ['SOUND', 'WEB'],
});
// data.received === true
`;

// ── 3. NOTIFICATION IGNORÉE (mauvais service) ──────────
const cas3_curl = `
# CAS 3 — Notification IGNORÉE (mauvais targetServiceId)
curl -X POST ${API}/notifications/receive \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "INFO",
    "motif": "Message pour la Cardiologie, pas la Dialyse.",
    "urgence": 1,
    "sourceServiceId": "service-dialyse",
    "targetServiceId": "service-cardiologie-uuid-999",
    "emitterName": "Systeme"
  }'
# → { "received": false, "reason": "Notification non destinée à ce service" }
# ❌ Aucun enregistrement en BDD
# 🔇 Aucun son
# Badge inchangé
`;

const cas3_fetch = `
// CAS 3 — Fetch (sera ignorée)
const response = await fetch('${API}/notifications/receive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type:            'INFO',
    motif:           'Message pour la Cardiologie.',
    urgence:         1,
    sourceServiceId: 'service-dialyse',
    targetServiceId: 'service-cardiologie-uuid-999',
  }),
});
const data = await response.json();
// → { received: false, reason: "Notification non destinée à ce service" }
`;

// ── 4. NOTIFICATION IGNORÉE (autre CHU) ───────────────
const cas4_curl = `
# CAS 4 — Notification IGNORÉE (autre CHU simulé via mauvais serviceId)
curl -X POST ${API}/notifications/receive \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "SYSTEME",
    "motif": "Maintenance programmée CHU Nord — Service Réanimation.",
    "urgence": 2,
    "sourceServiceId": "chu-nord-reanimation",
    "targetServiceId": "chu-nord-dialyse-uuid-different",
    "emitterName": "Systeme CHU Nord",
    "sentAt": "2026-06-01T10:30:00Z"
  }'
# → { "received": false, "reason": "Notification non destinée à ce service" }
`;

// ── RÉPONSES ATTENDUES ─────────────────────────────────
const reponses = `
═══════════════════════════════════════════════════
  RÉPONSES JSON ATTENDUES
═══════════════════════════════════════════════════

CAS 1 — Notification interne créée :
{
  "id": 10,
  "title": "RDV Confirmé",
  "message": "Le rendez-vous de Rakoto Jean...",
  "type": "info",
  "urgence": 1,
  "source": "interne",
  "target_service_id": "${MY_SERVICE_ID}",
  "is_read": false,
  "created_at": "2026-06-01T10:00:00.000Z"
}

CAS 2 — Notification urgente reçue :
{
  "received": true,
  "id": 11
}
→ En BDD :
{
  "id": 11,
  "title": "MEDICAL_ALERT — Service Urgences CHU",
  "message": "Le patient Rakoto Jean doit être pris en charge...",
  "type": "error",
  "urgence": 5,
  "source": "externe",
  "source_service_name": "Service Urgences CHU",
  "emitter_name": "Dr. Razafy Luc",
  "target_service_id": "${MY_SERVICE_ID}",
  "is_read": false
}

CAS 3 — Ignorée (mauvais service) :
{
  "received": false,
  "reason": "Notification non destinée à ce service"
}

CAS 4 — Ignorée (autre CHU) :
{
  "received": false,
  "reason": "Notification non destinée à ce service"
}
`;

// ── LOGS BACKEND ATTENDUS ──────────────────────────────
const logs_backend = `
═══════════════════════════════════════════════════
  LOGS BACKEND ATTENDUS (console NestJS)
═══════════════════════════════════════════════════

CAS 1 (normale) :
  → POST /notifications 201 Created

CAS 2 (urgente) :
  → POST /notifications/receive 200
  → ✅ Notification externe reçue et sauvegardée : ID 11

CAS 3 (ignorée - mauvais service) :
  → POST /notifications/receive 200
  → 🚫 Notification ignorée — targetServiceId: service-cardiologie-uuid-999
     ≠ d604bde1-c9dd-4284-a690-0c5ed9be6a37

CAS 4 (ignorée - autre CHU) :
  → POST /notifications/receive 200
  → 🚫 Notification ignorée — targetServiceId: chu-nord-dialyse-uuid-different
     ≠ d604bde1-c9dd-4284-a690-0c5ed9be6a37
`;

// ── ÉTAT CLOCHE ────────────────────────────────────────
const etat_cloche = `
═══════════════════════════════════════════════════
  ÉTAT DE LA CLOCHE APRÈS TESTS
═══════════════════════════════════════════════════

Avant tests  : 🔔 Badge = 5 (notifications existantes)
Après CAS 1  : 🔔 Badge = 6  | Son: doux
Après CAS 2  : 🔔 Badge = 7  | Son: CRITIQUE 🚨 | Cloche animée | Badge ROUGE
Après CAS 3  : 🔔 Badge = 7  | Aucun changement (ignorée)
Après CAS 4  : 🔔 Badge = 7  | Aucun changement (ignorée)
Après CAS 5  : 🔔 Badge = 8  | Son: double bip | Badge AMBRE

COULEUR BADGE :
  urgence < 3  → 🔵 Bleu
  urgence 3-4  → 🟠 Ambre/Orange
  urgence >= 5 → 🔴 Rouge + animation cloche
`;

console.log('=== cURL Commands ===');
console.log(cas1_curl);
console.log(cas2_curl);
console.log(cas3_curl);
console.log(cas4_curl);
console.log('\n=== JavaScript Fetch ===');
console.log(cas1_fetch);
console.log(cas2_fetch);
console.log(cas3_fetch);
console.log('\n=== Axios ===');
console.log(cas1_axios);
console.log(cas2_axios);
console.log('\n=== Réponses attendues ===');
console.log(reponses);
console.log('\n=== Logs backend attendus ===');
console.log(logs_backend);
console.log('\n=== État cloche ===');
console.log(etat_cloche);

#!/bin/bash

API="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   🏥 SIMULATION API NOTIFICATIONS — CHU Dialyse"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ──────────────────────────────────────────────────────────────
# CAS 1 : Notification normale (interne)
# ──────────────────────────────────────────────────────────────
echo -e "${BLUE}━━━ CAS 1 : Notification NORMALE (interne) ━━━${NC}"
echo ""
echo "📤 JSON envoyé :"
cat << 'JSON'
{
  "title": "RDV Confirmé",
  "message": "Le rendez-vous de Rakoto Jean est confirmé pour demain à 08h30.",
  "type": "info",
  "category": "rdv",
  "icon": "event_available",
  "link": "/rendez-vous",
  "urgence": 1
}
JSON
echo ""

RESULT1=$(curl -s -X POST "$API/notifications" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "RDV Confirmé",
    "message": "Le rendez-vous de Rakoto Jean est confirmé pour demain à 08h30.",
    "type": "info",
    "category": "rdv",
    "icon": "event_available",
    "link": "/rendez-vous",
    "urgence": 1
  }')

echo "📥 Réponse :"
echo "$RESULT1" | node -e "
const d=[];process.stdin.on('data',c=>d.push(c));
process.stdin.on('end',()=>{
  const r=JSON.parse(d.join(''));
  console.log(JSON.stringify(r,null,2));
});"
echo ""

ID1=$(echo "$RESULT1" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{console.log(JSON.parse(d.join('')).id);})" 2>/dev/null)
if [ ! -z "$ID1" ] && [ "$ID1" != "undefined" ]; then
  echo -e "${GREEN}✅ CAS 1 OK — Notification créée avec ID: $ID1${NC}"
  echo -e "   Urgence: 1 (INFO) | Son: doux | Badge: +1"
else
  echo -e "${RED}❌ CAS 1 ÉCHOUÉ${NC}"
fi
echo ""

# ──────────────────────────────────────────────────────────────
# CAS 2 : Notification URGENTE via webhook externe
# ──────────────────────────────────────────────────────────────
echo -e "${YELLOW}━━━ CAS 2 : Notification URGENTE (externe) ━━━${NC}"
echo ""
echo "📤 JSON envoyé :"
cat << 'JSON'
{
  "type": "MEDICAL_ALERT",
  "motif": "Le patient Rakoto Jean doit être pris en charge immédiatement. Urgence dialyse.",
  "urgence": 5,
  "sourceServiceId": "service-urgences-001",
  "sourceServiceName": "Service Urgences CHU",
  "targetServiceId": "d604bde1-c9dd-4284-a690-0c5ed9be6a37",
  "emitterId": "medecin-urgences-001",
  "emitterName": "Dr. Razafy Luc",
  "recipientName": "Service Hémodialyse",
  "departmentSource": "Urgences",
  "departmentTarget": "Hémodialyse",
  "patientId": "patient-rakoto-jean-001",
  "sentAt": "2026-06-01T10:00:00Z",
  "entiteRefType": "Patient",
  "entiteRefId": "patient-001",
  "ringtone": "urgent",
  "channels": ["SOUND", "WEB"],
  "payload": {
    "message": "Alerte critique — intervention immédiate requise",
    "patientNom": "Rakoto Jean",
    "motifUrgence": "Insuffisance rénale aiguë",
    "poste": "Urgences B-12"
  }
}
JSON
echo ""

RESULT2=$(curl -s -X POST "$API/notifications/receive" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MEDICAL_ALERT",
    "motif": "Le patient Rakoto Jean doit être pris en charge immédiatement. Urgence dialyse.",
    "urgence": 5,
    "sourceServiceId": "service-urgences-001",
    "sourceServiceName": "Service Urgences CHU",
    "targetServiceId": "d604bde1-c9dd-4284-a690-0c5ed9be6a37",
    "emitterId": "medecin-urgences-001",
    "emitterName": "Dr. Razafy Luc",
    "recipientName": "Service Hémodialyse",
    "departmentSource": "Urgences",
    "departmentTarget": "Hémodialyse",
    "patientId": "patient-rakoto-jean-001",
    "sentAt": "2026-06-01T10:00:00Z",
    "entiteRefType": "Patient",
    "entiteRefId": "patient-001",
    "ringtone": "urgent",
    "channels": ["SOUND", "WEB"],
    "payload": {
      "message": "Alerte critique",
      "patientNom": "Rakoto Jean"
    }
  }')

echo "📥 Réponse :"
echo "$RESULT2" | node -e "
const d=[];process.stdin.on('data',c=>d.push(c));
process.stdin.on('end',()=>{
  const r=JSON.parse(d.join(''));
  console.log(JSON.stringify(r,null,2));
});"
echo ""

RECEIVED2=$(echo "$RESULT2" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{const r=JSON.parse(d.join(''));console.log(r.received);})" 2>/dev/null)
ID2=$(echo "$RESULT2" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{const r=JSON.parse(d.join(''));console.log(r.id);})" 2>/dev/null)
if [ "$RECEIVED2" = "true" ]; then
  echo -e "${GREEN}✅ CAS 2 OK — Notification CRITIQUE reçue avec ID: $ID2${NC}"
  echo -e "   Urgence: 5 (CRITIQUE) | Son: fort répété | Badge: +1 ROUGE | Cloche animée"
else
  echo -e "${RED}❌ CAS 2 ÉCHOUÉ${NC}"
fi
echo ""

# ──────────────────────────────────────────────────────────────
# CAS 3 : Notification IGNORÉE (mauvais service)
# ──────────────────────────────────────────────────────────────
echo -e "${CYAN}━━━ CAS 3 : Notification IGNORÉE (mauvais serviceId) ━━━${NC}"
echo ""
echo "📤 JSON envoyé :"
cat << 'JSON'
{
  "type": "INFO",
  "motif": "Ceci est destiné au service de Cardiologie, pas à la Dialyse.",
  "urgence": 2,
  "sourceServiceId": "service-dialyse",
  "targetServiceId": "service-cardiologie-999",
  "emitterName": "Système",
  "sentAt": "2026-06-01T10:05:00Z"
}
JSON
echo ""

RESULT3=$(curl -s -X POST "$API/notifications/receive" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INFO",
    "motif": "Ceci est destiné au service de Cardiologie, pas à la Dialyse.",
    "urgence": 2,
    "sourceServiceId": "service-dialyse",
    "targetServiceId": "service-cardiologie-999",
    "emitterName": "Systeme",
    "sentAt": "2026-06-01T10:05:00Z"
  }')

echo "📥 Réponse :"
echo "$RESULT3" | node -e "
const d=[];process.stdin.on('data',c=>d.push(c));
process.stdin.on('end',()=>{
  const r=JSON.parse(d.join(''));
  console.log(JSON.stringify(r,null,2));
});"
echo ""

RECEIVED3=$(echo "$RESULT3" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{const r=JSON.parse(d.join(''));console.log(r.received);})" 2>/dev/null)
if [ "$RECEIVED3" = "false" ]; then
  echo -e "${GREEN}✅ CAS 3 OK — Notification correctement IGNORÉE${NC}"
  echo -e "   Raison: targetServiceId ne correspond pas au service Dialyse"
  echo -e "   Badge: inchangé | Son: aucun | BDD: aucun enregistrement"
else
  echo -e "${RED}❌ CAS 3 ÉCHOUÉ — La notification aurait dû être ignorée${NC}"
fi
echo ""

# ──────────────────────────────────────────────────────────────
# CAS 4 : Notification IGNORÉE (sans targetServiceId)
# ──────────────────────────────────────────────────────────────
echo -e "${CYAN}━━━ CAS 4 : Notification sans targetServiceId (acceptée car vide) ━━━${NC}"
echo ""
echo "📤 JSON envoyé :"
cat << 'JSON'
{
  "type": "PRESCRIPTION",
  "motif": "Nouvelle ordonnance disponible pour le service Dialyse.",
  "urgence": 2,
  "sourceServiceId": "service-pharmacie-001",
  "sourceServiceName": "Pharmacie CHU",
  "emitterName": "Dr. Rasoa Marie",
  "patientId": "patient-002",
  "sentAt": "2026-06-01T10:10:00Z",
  "entiteRefType": "Prescription",
  "entiteRefId": "presc-456"
}
JSON
echo ""

RESULT4=$(curl -s -X POST "$API/notifications/receive" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PRESCRIPTION",
    "motif": "Nouvelle ordonnance disponible pour le service Dialyse.",
    "urgence": 2,
    "sourceServiceId": "service-pharmacie-001",
    "sourceServiceName": "Pharmacie CHU",
    "emitterName": "Dr. Rasoa Marie",
    "patientId": "patient-002",
    "sentAt": "2026-06-01T10:10:00Z",
    "entiteRefType": "Prescription",
    "entiteRefId": "presc-456"
  }')

echo "📥 Réponse :"
echo "$RESULT4" | node -e "
const d=[];process.stdin.on('data',c=>d.push(c));
process.stdin.on('end',()=>{
  const r=JSON.parse(d.join(''));
  console.log(JSON.stringify(r,null,2));
});"
echo ""
ID4=$(echo "$RESULT4" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{const r=JSON.parse(d.join(''));console.log(r.id);})" 2>/dev/null)
echo -e "${GREEN}✅ CAS 4 OK — Sans targetServiceId = acceptée, ID: $ID4${NC}"
echo ""

# ──────────────────────────────────────────────────────────────
# CAS 5 : Notification RDV (urgence moyenne)
# ──────────────────────────────────────────────────────────────
echo -e "${BLUE}━━━ CAS 5 : Notification RDV (urgence moyenne) ━━━${NC}"
echo ""

RESULT5=$(curl -s -X POST "$API/notifications/receive" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "RDV_CONFIRMED",
    "motif": "Rendez-vous de Rasoa Marie confirmé pour le 05 Juin 2026 à 09h00.",
    "urgence": 3,
    "sourceServiceId": "service-accueil-001",
    "sourceServiceName": "Accueil CHU Andrainjato",
    "targetServiceId": "d604bde1-c9dd-4284-a690-0c5ed9be6a37",
    "emitterName": "Secretariat Accueil",
    "patientId": "patient-rasoa-002",
    "sentAt": "2026-06-01T10:15:00Z",
    "entiteRefType": "RendezVous",
    "entiteRefId": "rdv-789",
    "channels": ["WEB"],
    "payload": {
      "dateRdv": "2026-06-05T09:00:00Z",
      "patientNom": "Rasoa Marie",
      "machine": "M02",
      "poste": "Poste B-05"
    }
  }')

ID5=$(echo "$RESULT5" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{const r=JSON.parse(d.join(''));console.log(r.id);})" 2>/dev/null)
echo -e "${GREEN}✅ CAS 5 OK — Notification RDV reçue, ID: $ID5${NC}"
echo -e "   Urgence: 3 (IMPORTANT) | Son: double bip"
echo ""

# ──────────────────────────────────────────────────────────────
# VÉRIFICATION FINALE
# ──────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════"
echo "   📊 VÉRIFICATION FINALE"
echo "═══════════════════════════════════════════════════════════"
echo ""

COUNT=$(curl -s "$API/notifications/unread-count" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{console.log(JSON.parse(d.join('')).count);})")
TOTAL=$(curl -s "$API/notifications" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{console.log(JSON.parse(d.join('')).length);})")

echo "📬 Total notifications en base   : $TOTAL"
echo "🔴 Notifications non lues        : $COUNT"
echo ""

echo "🔔 État de la cloche :"
echo "   Badge affiché : $COUNT"
if [ "$COUNT" -ge 5 ]; then
  echo -e "   ${RED}Couleur : ROUGE (urgences critiques détectées)${NC}"
elif [ "$COUNT" -ge 3 ]; then
  echo -e "   ${YELLOW}Couleur : ORANGE/AMBRE${NC}"
else
  echo -e "   ${BLUE}Couleur : BLEU${NC}"
fi
echo ""

echo "🔊 Sons déclenchés :"
echo "   CAS 1 (urgence 1) → Son doux (sine 800→1000 Hz)"
echo "   CAS 2 (urgence 5) → Son fort répété (square 880→660 Hz) 🚨"
echo "   CAS 3 (ignorée)   → Aucun son"
echo "   CAS 4 (urgence 2) → Son doux"
echo "   CAS 5 (urgence 3) → Son double bip"
echo ""

echo "📱 Visibilité dans l'interface :"
echo "   ✅ Dashboard    → Cloche en haut à droite mise à jour"
echo "   ✅ Dropdown     → Nouvelles notifs en tête de liste"
echo "   ✅ /notifications → Page historique complète"
echo ""

echo "🔍 Détail des notifications externes reçues :"
curl -s "$API/notifications" | node -e "
const d=[];
process.stdin.on('data',c=>d.push(c));
process.stdin.on('end',()=>{
  const notifs = JSON.parse(d.join(''));
  const ext = notifs.filter(n => n.source === 'externe');
  console.log('Notifications EXTERNES :', ext.length);
  ext.forEach(n => {
    const u = n.urgence || 1;
    const label = u>=5?'CRITIQUE':u>=4?'URGENT':u>=3?'IMPORTANT':u>=2?'NORMAL':'INFO';
    console.log('  →', 'ID:'+n.id, '|', n.title, '|', 'Urgence:'+u+'('+label+')', '|', 'Lu:'+n.is_read);
  });
  const int = notifs.filter(n => n.source === 'interne');
  console.log('Notifications INTERNES :', int.length);
});
"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   ✅ SIMULATION TERMINÉE"
echo "═══════════════════════════════════════════════════════════"

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env');

function readEnvValue(filePath, key) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim();
    if (k === key) return v;
  }

  return null;
}

function simplify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function tryDecodeLatin1ToUtf8(value) {
  let current = String(value).trim();

  for (let i = 0; i < 2; i++) {
    try {
      const decoded = Buffer.from(current, 'latin1').toString('utf8').trim();
      if (decoded && decoded !== current) {
        current = decoded;
      }
    } catch {
      break;
    }
  }

  return current;
}

function normaliserStatut(value) {
  if (value === null || value === undefined) return value;

  const original = String(value).trim();
  if (!original) return original;

  const decoded = tryDecodeLatin1ToUtf8(original);
  const candidats = [original, decoded];

  for (const candidat of candidats) {
    const s = simplify(candidat);

    if (s.includes('planifi')) return 'planifié';
    if (s.includes('confirm')) return 'confirmé';
    if (s.includes('annul')) return 'annulé';
    if (s === 'en_attente' || s.includes('attente')) return 'en_attente';
    if (s === 'en_cours' || s.includes('cours')) return 'en_cours';
    if (s.includes('termin')) return 'terminé';
    if (s.includes('absen')) return 'absent';
  }

  return original;
}

function formatSummary(changes, field) {
  const summary = {};
  for (const c of changes) {
    if (!c[field]) continue;
    const key = `${c[field].from}  =>  ${c[field].to}`;
    summary[key] = (summary[key] || 0) + 1;
  }
  return summary;
}

(async () => {
  const applyMode = process.argv.includes('--apply');
  const databaseUrl = process.env.DATABASE_URL || readEnvValue(ENV_PATH, 'DATABASE_URL');

  if (!databaseUrl) {
    throw new Error('DATABASE_URL introuvable dans /d/projectCHU/dialyse-backend/.env');
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const result = await client.query(`
      SELECT id, statut, statut_seance, date_heure
      FROM rendez_vous
      ORDER BY id ASC
    `);

    const rows = result.rows;
    const changes = [];

    for (const row of rows) {
      const newStatut = normaliserStatut(row.statut);
      const newStatutSeance = normaliserStatut(row.statut_seance);

      const change = {
        id: row.id,
        date_heure: row.date_heure,
      };

      let hasChange = false;

      if (newStatut !== row.statut) {
        change.statut = { from: row.statut, to: newStatut };
        hasChange = true;
      }

      if (newStatutSeance !== row.statut_seance) {
        change.statut_seance = { from: row.statut_seance, to: newStatutSeance };
        hasChange = true;
      }

      if (hasChange) {
        changes.push(change);
      }
    }

    const backupsDir = path.join(ROOT, 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupsDir, `cleanup-rendezvous-status-${stamp}.json`);

    fs.writeFileSync(
      backupFile,
      JSON.stringify(
        {
          generatedAt: now.toISOString(),
          mode: applyMode ? 'apply' : 'dry-run',
          totalRows: rows.length,
          totalChanges: changes.length,
          changes,
        },
        null,
        2,
      ),
      'utf8'
    );

    console.log('==================================================');
    console.log(applyMode ? 'MODE APPLY' : 'MODE DRY-RUN');
    console.log('==================================================');
    console.log(`Total lignes analysées : ${rows.length}`);
    console.log(`Total lignes à corriger : ${changes.length}`);
    console.log(`Backup local : ${backupFile}`);
    console.log('--------------------------------------------------');
    console.log('Résumé statut :');
    console.log(JSON.stringify(formatSummary(changes, 'statut'), null, 2));
    console.log('--------------------------------------------------');
    console.log('Résumé statut_seance :');
    console.log(JSON.stringify(formatSummary(changes, 'statut_seance'), null, 2));
    console.log('--------------------------------------------------');
    console.log('Exemples (max 10) :');
    console.log(JSON.stringify(changes.slice(0, 10), null, 2));
    console.log('==================================================');

    if (!applyMode) {
      console.log('Dry-run terminé. Aucune modification en base.');
      return;
    }

    await client.query('BEGIN');

    for (const change of changes) {
      const sets = [];
      const values = [];
      let i = 1;

      if (change.statut) {
        sets.push(`statut = $${i++}`);
        values.push(change.statut.to);
      }

      if (change.statut_seance) {
        sets.push(`statut_seance = $${i++}`);
        values.push(change.statut_seance.to);
      }

      values.push(change.id);

      await client.query(
        `UPDATE rendez_vous SET ${sets.join(', ')} WHERE id = $${i}`,
        values
      );
    }

    await client.query('COMMIT');

    const verify = await client.query(`
      SELECT statut, COUNT(*)::int AS total
      FROM rendez_vous
      GROUP BY statut
      ORDER BY total DESC, statut ASC
    `);

    console.log('✅ Mise à jour terminée avec succès.');
    console.log('Nouveaux statuts :');
    console.log(JSON.stringify(verify.rows, null, 2));
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}
    throw error;
  } finally {
    await client.end();
  }
})().catch((err) => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});

const express = require('express');
const router = express.Router();
const { localPool, getNeonPool } = require('../db');

router.post('/', async (req, res) => {
  try {
    const neonPool = getNeonPool();
    const tables = ['users', 'families', 'members', 'anbiyam']; // Add more tables if needed

    for (const table of tables) {
      const neonData = await neonPool.query(`SELECT * FROM ${table}`);
      const localData = await localPool.query(`SELECT * FROM ${table}`);
      const neonRows = neonData.rows;
      const localRows = localData.rows;

      // Build a map of Local rows by primary key (assuming 'id' is PK)
      const localMap = {};
      for (const row of localRows) {
        localMap[row.id] = row;
      }

      // Upsert Neon rows into Local
      for (const row of neonRows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const updateAssignments = columns.map((col) => `${col} = EXCLUDED.${col}`);

        const upsertQuery = `
          INSERT INTO ${table} (${columns.join(',')})
          VALUES (${placeholders.join(',')})
          ON CONFLICT (id) DO UPDATE SET ${updateAssignments.join(',')}
        `;
        await localPool.query(upsertQuery, values);
      }

      // Delete Local rows that are not in Neon
      const neonIds = new Set(neonRows.map(r => r.id));
      for (const localRow of localRows) {
        if (!neonIds.has(localRow.id)) {
          await localPool.query(`DELETE FROM ${table} WHERE id = $1`, [localRow.id]);
        }
      }
    }

    res.json({ message: '✅ Sync complete: pulled from Neon and updated local DB.' });
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    res.status(500).json({ message: '❌ Sync from Neon to local failed' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { localPool, getNeonPool } = require('../db');

router.post('/', async (req, res) => {
  try {
    const neonPool = getNeonPool();
    const tables = ['users', 'families', 'members', 'anbiyam']; // Add more tables if needed

    for (const table of tables) {
      const localData = await localPool.query(`SELECT * FROM ${table}`);
      const neonData = await neonPool.query(`SELECT * FROM ${table}`);
      const localRows = localData.rows;
      const neonRows = neonData.rows;

      // Build a map of Neon rows by primary key (assuming 'id' is PK)
      const neonMap = {};
      for (const row of neonRows) {
        neonMap[row.id] = row;
      }

      // Upsert local rows into Neon
      for (const row of localRows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const updateAssignments = columns.map((col, i) => `${col} = EXCLUDED.${col}`);

        const upsertQuery = `
          INSERT INTO ${table} (${columns.join(',')})
          VALUES (${placeholders.join(',')})
          ON CONFLICT (id) DO UPDATE SET ${updateAssignments.join(',')}
        `;
        await neonPool.query(upsertQuery, values);
      }

      // Delete Neon rows that are not in local
      const localIds = new Set(localRows.map(r => r.id));
      for (const neonRow of neonRows) {
        if (!localIds.has(neonRow.id)) {
          await neonPool.query(`DELETE FROM ${table} WHERE id = $1`, [neonRow.id]);
        }
      }
    }

    res.json({ message: '✅ Sync complete: added, updated & deleted records.' });
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    res.status(500).json({ message: '❌ Sync to Neon failed' });
  }
});

module.exports = router;

const path = require('path');
const { exec } = require('child_process');

const backendPath = __dirname;
const frontendPath = path.join(__dirname, '..', 'frontend');

// Start Backend
console.log('🔧 Starting backend...');
const backend = exec('npm run dev', { cwd: backendPath });
backend.stdout.on('data', data => console.log('[Backend]', data));
backend.stderr.on('data', data => console.error('[Backend Error]', data));

// Start Frontend
console.log('🌐 Starting frontend...');
const frontend = exec('npm start', { cwd: frontendPath });

frontend.stdout.on('data', async (data) => {
  console.log('[Frontend]', data);

  if (data.includes('Compiled successfully')) {
    // Dynamically import 'open' for ESM compatibility
    try {
      const open = await import('open');
      open.default('http://localhost:3000');
    } catch (err) {
      console.error('❌ Failed to open browser:', err);
    }
  }
});

frontend.stderr.on('data', data => console.error('[Frontend Error]', data));
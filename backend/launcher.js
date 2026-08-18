const { exec } = require('child_process');
const path = require('path');

// === Define absolute paths ===
const backendPath = __dirname;
const frontendPath = path.join(__dirname, '..', 'frontend');

// === Start Backend ===
console.log('🔧 Starting backend server...');
const backend = exec('npm run dev', { cwd: backendPath });

backend.stdout.on('data', data => {
  console.log('[Backend]', data.toString());
});
backend.stderr.on('data', data => {
  console.error('[Backend Error]', data.toString());
});
backend.on('exit', code => {
  console.log(`Backend exited with code ${code}`);
});

// === Start Frontend ===
console.log('🌐 Starting frontend React app...');
const frontend = exec('npm start', { cwd: frontendPath });

frontend.stdout.on('data', data => {
  console.log('[Frontend]', data.toString());
});
frontend.stderr.on('data', data => {
  console.error('[Frontend Error]', data.toString());
});
frontend.on('exit', code => {
  console.log(`Frontend exited with code ${code}`);
});

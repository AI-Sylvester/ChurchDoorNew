import { Capacitor } from '@capacitor/core';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

let API_BASE_URL;

if (Capacitor.isNativePlatform()) {
  // On Android/iOS, localhost refers to the mobile device itself, not your computer.
  // - If using an Android Emulator to test locally, uncomment the 10.0.2.2 line.
  // - If using a physical Android device on WiFi, use your PC's IPv4 address (e.g., http://192.168.x.x:5000/api).
  // - For production, use the Render URL.
  
  // API_BASE_URL = 'http://10.0.2.2:5000/api'; // (Local Android Emulator)
  API_BASE_URL = 'https://churchdoornew.onrender.com/api'; // (Production)
} else if (isLocalhost) {
  API_BASE_URL = 'http://localhost:5000/api';
} else {
  API_BASE_URL = 'https://churchdoornew.onrender.com/api';
}

export default API_BASE_URL;
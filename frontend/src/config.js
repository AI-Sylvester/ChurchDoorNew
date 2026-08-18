// Determine API URL based on where the app is hosted
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost 
  ? 'http://localhost:5000/api' 
  : 'https://churchdoornew.onrender.com/api';

export default API_BASE_URL;
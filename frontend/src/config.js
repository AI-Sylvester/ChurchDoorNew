const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'http://192.168.1.24:5000/api'; // fallback or actual IP

export default API_BASE_URL;
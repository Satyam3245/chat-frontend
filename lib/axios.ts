import axios from 'axios';

const API_URL = 'https://chat-backend-3-jr4u.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData, {
    withCredentials: true,
  });

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }

  return response.data.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData, {
    withCredentials: true,
  });

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }

  return response.data.data;
};

// Logout user
const logout = async () => {
  await axios.get(API_URL + 'logout', {
    withCredentials: true,
  });
  localStorage.removeItem('user');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;

import { cookieService } from './storage';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://4j9s67zbu6.execute-api.us-east-1.amazonaws.com/prod';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/bondoo/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      // Guardar token y usuario en localStorage
      if (data.token) {
        localStorage.setItem('bondoo_token', data.token);
        localStorage.setItem('bondoo_user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const token = localStorage.getItem('bondoo_token');
      const response = await fetch(`${BASE_URL}/bondoo/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      // Actualizar usuario en localStorage
      const currentUser = JSON.parse(localStorage.getItem('bondoo_user') || '{}');
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('bondoo_user', JSON.stringify(updatedUser));

      return data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('bondoo_token');
    localStorage.removeItem('bondoo_user');
  },

  getToken: () => localStorage.getItem('bondoo_token'),
  
  getUser: () => {
    const user = localStorage.getItem('bondoo_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('bondoo_token'),

  // Devuelve SOLO los usuarios vinculados al partnerCode del usuario autenticado
  getReferrals: async () => {
    try {
      const token = localStorage.getItem('bondoo_token');
      const response = await fetch(`${BASE_URL}/bondoo/partner/referrals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error fetching referrals');
      return data;
    } catch (error) {
      console.error('Get referrals error:', error);
      throw error;
    }
  },

  // Verifica en el backend si un partnerCode está disponible (case-insensitive)
  checkPartnerCode: async (code) => {
    try {
      const token = localStorage.getItem('bondoo_token');
      const response = await fetch(`${BASE_URL}/bondoo/partner/check-code?code=${encodeURIComponent(code)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error verificando código');
      return data.available;
    } catch (error) {
      console.error('Check partner code error:', error);
      throw error;
    }
  }
};

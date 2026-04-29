import axios from 'axios';
import Cookies from 'js-cookie';

export const ensureToken = async () => {
  const existingToken = Cookies.get('token');
  if (existingToken) {
    return existingToken;
  }

  try {
    const GUEST_API = `${import.meta.env.VITE_CHATBOT_API_URL}/api/auth/guest`;
    const response = await axios.post(GUEST_API);
    const { token, visitor } = response.data;

    if (token) {
      // Set cookie for 7 days (matching typical JWT expiry or session)
      Cookies.set('token', token, { expires: 7 });
      
      // Also store visitor info for UI use
      if (visitor) {
        localStorage.setItem('visitor', JSON.stringify(visitor));
      }
      
      return token;
    }
  } catch (error) {
    console.error('Failed to fetch guest token:', error);
    throw error;
  }
};

import { AuthResponse, User } from '@/lib/types/auth';
import Cookies from 'js-cookie';

const AUTH_COOKIE_NAME = 'micha_auth_token';
const USER_DATA_COOKIE_NAME = 'micha_user_data';

export const authService = {
  setAuth: (data: AuthResponse) => {
    const oneHourFromNow = new Date(new Date().getTime() + 60 * 60 * 1000);
    // Stocke le token dans un cookie
    Cookies.set(AUTH_COOKIE_NAME, data.userToken, { 
      expires: oneHourFromNow, // expire après 7 jours
      secure: process.env.NODE_ENV === 'production', // utilise HTTPS en production
      sameSite: 'strict'
    });

    // Stocke les données utilisateur dans un cookie séparé
    const userData = {
      firstName: data.userFirstname,
      lastName: data.userLastname,
      phoneNumber: data.userPhoneNumber,
      email: data.userEmail
    };
    Cookies.set(USER_DATA_COOKIE_NAME, JSON.stringify(userData), {
      expires: oneHourFromNow,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  },

  clearAuth: () => {
    Cookies.remove(AUTH_COOKIE_NAME);
    Cookies.remove(USER_DATA_COOKIE_NAME);
  },

  getToken: (): string | null => {
    return Cookies.get(AUTH_COOKIE_NAME) || null;
  },

  getUserData: (): User | null => {
    const userData = Cookies.get(USER_DATA_COOKIE_NAME);
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: (): boolean => {
    return !!Cookies.get(AUTH_COOKIE_NAME);
  },
};


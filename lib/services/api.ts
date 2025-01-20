import { API_ROUTES } from '@/lib/constants/routes'
import type { SignInCredentials, AuthResponse } from '@/lib/types/auth'
import { AuthErrorType, AuthError } from '@/lib/types/errors'

export class AuthService {
  static async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(API_ROUTES.SIGNIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
   
        switch (response.status) {
          case 403:
            if (errorData.message.includes("n'est pas disponible dans la base")) {
              throw { type: AuthErrorType.USER_NOT_FOUND, message: errorData.message };
            } else if (errorData.message.includes("n'etes pas autorisé")) {
              throw { type: AuthErrorType.NOT_AUTHORIZED, message: errorData.message };
            } else if (errorData.message.includes("mot de passe est incorrecte")) {
              throw { type: AuthErrorType.INVALID_CREDENTIALS, message: errorData.message };
            } else if (errorData.message.includes("compte est desactivé")) {
              throw { type: AuthErrorType.ACCOUNT_INACTIVE, message: errorData.message };
            }
            break;
          case 500:
            throw { type: AuthErrorType.SERVER_ERROR, message: errorData.message || 'Erreur serveur, veuillez réessayer plus tard' };
          default:
            throw { type: AuthErrorType.UNKNOWN_ERROR, message: 'Une erreur inconnue est survenue' };
        }
      }

      return await response.json();
    } catch (error) {
      if ((error as AuthError).type) {
        throw error;
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw { type: AuthErrorType.NETWORK_ERROR, message: 'Erreur de connexion, vérifiez votre connexion internet' };
      }
      throw { type: AuthErrorType.UNKNOWN_ERROR, message: 'Une erreur inconnue est survenue' };
    }
  }
}


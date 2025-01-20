export enum AuthErrorType {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    NOT_AUTHORIZED = 'NOT_AUTHORIZED',
    ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
    SERVER_ERROR = 'SERVER_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }
  
  export interface AuthError {
    type: AuthErrorType;
    message: string;
  }
  
  
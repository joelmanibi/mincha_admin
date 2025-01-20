export interface User {
    userFirstname: string;
    userLastname: string;
    userPhoneNumber: string;
    userEmail: string
  }
  
  export interface AuthResponse {
    userToken: string;
    userFirstname: string;
    userLastname: string;
    userPhoneNumber: string;
    userEmail: string;
  }
  
  export interface SignInCredentials {
    userPhoneOrEmail: string;
    userPassword: string;
  }
  
  export interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (data: AuthResponse) => void;
    clearAuth: () => void;
  }
  
  
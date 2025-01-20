export const ROUTES = {
    AUTH: '/auth',
    DASHBOARD: '/dashboard',
    SETTINGS: '/settings',
    USERS: '/users',
  } as const
  
  const API_BASE_URL = process.env.NEXT_API_URL || "http://dev-mani.tech:8000"

export const API_ROUTES = {
  BASE_URL: `${API_BASE_URL}/api`,
  GET_ALL_USERS: `${API_BASE_URL}/api/user/getall-users`,
  UPDATE_USER_STATUS: (userId: number) => `${API_BASE_URL}/api/user/${userId}/status`,
  GET_USER_BY_ID: (userId: number) => `${API_BASE_URL}/api/user/${userId}`,
  VALIDATE_ACCOUNT: `${API_BASE_URL}/api/account/validate-owner`,
  DELETE_USER: (userId: number) => `${API_BASE_URL}/api/user/${userId}`,
  CREATE_USER: `${API_BASE_URL}/api/user/create-sudoer`,
  GET_ALL_PROPERTIES: `${API_BASE_URL}/api/property/getall-property`,
  GET_PROPERTY_PHOTOS: (propertyId: number) => `${API_BASE_URL}/api/property/get-property-photo/${propertyId}`,
  ADD_PROPERTY: `${API_BASE_URL}/api/property/add-property-by-sudo`,
  GET_ALL_CITIES: `${API_BASE_URL}/api/account/get-all-city/`,
  GET_ALL_ACCOUNTS: `${API_BASE_URL}/api/account/get-all-account/`,
  GET_ALL_LEVELS: `${API_BASE_URL}/api/property/getall-level`,
  GET_ALL_PROPERTY_TYPES: `${API_BASE_URL}/api/property/getall-property-type`,
  VALIDATE_PROPERTY: `${API_BASE_URL}/api/property/validate`,
  DELETE_PROPERTY: (propertyId: number) => `${API_BASE_URL}/api/property/delete-property/${propertyId}`,
} as const


  
  
  
  
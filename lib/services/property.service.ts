import { API_ROUTES } from '@/lib/constants/routes'
import type { Property, PropertyPhoto } from '@/lib/types/property.types'

const getAuthToken = () => {
  return document.cookie.split('; ').find(row => row.startsWith('micha_auth_token='))?.split('=')[1]
}

export const propertyService = {
  getAllProperties: async () => {
    try {
      const authToken = getAuthToken()

      if (!authToken) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch(API_ROUTES.GET_ALL_PROPERTIES, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: '*/*',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur réseau')
      }

      const data = await response.json()
      return data.property as Property[]
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés:', error)
      return { error: 'Une erreur est survenue lors de la récupération des propriétés' }
    }
  },

  getPropertyPhotos: async (propertyId: number) => {
    try {
      const authToken = getAuthToken()

      if (!authToken) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch(API_ROUTES.GET_PROPERTY_PHOTOS(propertyId), {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: '*/*',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur réseau')
      }

      const data = await response.json()
      return data.propertyPhoto as PropertyPhoto[]
    } catch (error) {
      console.error('Erreur lors de la récupération des photos:', error)
      return { error: 'Une erreur est survenue lors de la récupération des photos' }
    }
  },

  addProperty: async (formData: FormData) => {
    try {
      const authToken = getAuthToken()

      if (!authToken) {
        throw new Error('Token d\'authentification manquant')
      }
      console.log(formData);
      
      
      const response = await fetch(API_ROUTES.ADD_PROPERTY, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: '*/*',
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la propriété')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la propriété:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'ajout de la propriété' 
      }
    }
  },

  formatPrice: (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  },

  formatArea: (area: number) => {
    return `${area} m²`
  }
}


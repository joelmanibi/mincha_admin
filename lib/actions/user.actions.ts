'use server'

import { cookies } from 'next/headers'
import { API_ROUTES } from '@/lib/constants/routes'

export async function getUserData() {
  try {
    const cookieStore = cookies()
    const authToken = (await cookieStore).get('micha_auth_token')?.value

    if (!authToken) {
      throw new Error('Token d\'authentification manquant')
    }

    const response = await fetch(API_ROUTES.GET_ALL_USERS, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: '*/*',
      },
    })

    if (!response.ok) {
      throw new Error('Erreur réseau')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    return { error: 'Erreur lors de la récupération des utilisateurs' }
  }
}

export async function deleteUser(userId: number) {
  try {
    const cookieStore = cookies()
    const authToken = (await cookieStore).get('micha_auth_token')?.value

    if (!authToken) {
      throw new Error('Token d\'authentification manquant')
    }

    const response = await fetch(API_ROUTES.DELETE_USER(userId), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: '*/*',
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'utilisateur')
    }

    const data = await response.json()
    return { success: true, message: data.message }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return { 
      success: false, 
      error: 'Une erreur est survenue lors de la suppression de l\'utilisateur' 
    }
  }
}

interface CreateUserData {
  userFirstname: string
  userLastname: string
  userPhoneNumber: string
  userEmail: string
  userCountry: string
  userPassword: string
  userGender: string
  userRoleID: string
}

export async function createUser(data: CreateUserData) {
  try {
    const cookieStore = cookies()
    const authToken = (await cookieStore).get('micha_auth_token')?.value

    if (!authToken) {
      throw new Error('Token d\'authentification manquant')
    }

    const response = await fetch(API_ROUTES.CREATE_USER, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la création de l\'utilisateur')
    }

    const result = await response.json()
    return { success: true, data: result }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    }
  }
}


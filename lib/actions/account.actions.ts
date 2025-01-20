'use server'

import { cookies } from 'next/headers'
import { API_ROUTES } from '@/lib/constants/routes'

interface ValidateAccountParams {
  userId: number
  firstWallet: number
  accountIsApproved: number
  accountTypeID: number
  validationComment: string | null
}

export async function validateAccount(params: ValidateAccountParams) {
  try {
    const cookieStore = cookies()
    const authToken = (await cookieStore).get('micha_auth_token')?.value

    if (!authToken) {
      throw new Error('Token d\'authentification manquant')
    }

    const response = await fetch(API_ROUTES.VALIDATE_ACCOUNT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la validation du compte')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la validation du compte:', error)
    return { error: 'Une erreur est survenue lors de la validation du compte' }
  }
}


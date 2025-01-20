"use server"

import { cookies } from "next/headers"
import { API_ROUTES } from "@/lib/constants/routes"

interface ValidatePropertyParams {
  propertyId: number
  propertyApproved: number
  approvalComment?: string | null
}

export async function validateProperty(params: ValidatePropertyParams) {
  try {
    const cookieStore = cookies()
    const authToken = (await cookieStore).get("micha_auth_token")?.value

    if (!authToken) {
      throw new Error("Token d'authentification manquant")
    }

    const response = await fetch(API_ROUTES.VALIDATE_PROPERTY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la validation de la propriété")
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Erreur lors de la validation de la propriété:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    }
  }
}

export async function deleteProperty(propertyId: number) {
  try {
    const cookieStore = cookies()
    const authToken = (await cookieStore).get("micha_auth_token")?.value

    if (!authToken) {
      throw new Error("Token d'authentification manquant")
    }

    const response = await fetch(API_ROUTES.DELETE_PROPERTY(propertyId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "*/*",
      },
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de la propriété")
    }

    const data = await response.json()
    return { success: true, message: data.message }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression",
    }
  }
}


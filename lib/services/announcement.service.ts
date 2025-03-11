import { authService } from "./authService"
import { API_ROUTES } from "@/lib/constants/routes"
import type { AnnouncementResponse, PropertyPhoto } from "../types/announcement.types"

export const announcementService = {
  getAllAnnouncements: async (): Promise<AnnouncementResponse> => {
    const token = authService.getToken()

    const response = await fetch(API_ROUTES.GET_ANNOUNCEMENT, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch announcements")
    }

    return response.json()
  },

  getPropertyPhotos: async (propertyId: number): Promise<PropertyPhoto[]> => {
    const token = authService.getToken()

    const response = await fetch(API_ROUTES.GET_PROPERTY_PHOTOS(propertyId), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch property photos")
    }

    const data = await response.json()
    return data.propertyPhoto || []
  },

  formatPrice: (price: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(price)
  },
}

